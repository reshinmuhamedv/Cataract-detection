
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit_aer import Aer
from qiskit_machine_learning.neural_networks import EstimatorQNN
from qiskit.quantum_info import SparsePauliOp
from torch.autograd import Function

# ── Quantum Circuit Definition ──────────────────────────────────────────────
def create_quantum_circuit(n_qubits=4):
    x_params = ParameterVector("x", n_qubits)
    w_params = ParameterVector("w", n_qubits)
    
    qc = QuantumCircuit(n_qubits)
    # Feature encoding
    for i in range(n_qubits):
        qc.ry(x_params[i], i)

    # Variational layer
    for i in range(n_qubits):
        qc.rx(w_params[i], i)
        qc.rz(w_params[i], i)

    # Entanglement
    for i in range(n_qubits - 1):
        qc.cx(i, i + 1)
    qc.cx(n_qubits - 1, 0) # Close the loop

    return qc, x_params, w_params

# ── Custom Autograd Function for QNN ────────────────────────────────────────
class QuantumFunction(Function):
    @staticmethod
    def forward(ctx, inputs, weights, qnn):
        ctx.qnn = qnn
        ctx.save_for_backward(inputs, weights)

        inputs_np = inputs.detach().cpu().numpy()
        weights_np = weights.detach().cpu().numpy()

        results = []
        for inp in inputs_np:
            raw = qnn.forward(inp, weights_np)
            # EstimatorQNN forward returns an array of shape (num_observables,)
            val = float(np.array(raw).flatten()[0])
            results.append(val)

        results_np = np.array(results, dtype=np.float32)
        return torch.from_numpy(results_np).unsqueeze(1).to(inputs.device)

    @staticmethod
    def backward(ctx, grad_output):
        inputs, weights = ctx.saved_tensors
        qnn = ctx.qnn

        inputs_np = inputs.detach().cpu().numpy()
        weights_np = weights.detach().cpu().numpy()
        eps = 0.01

        # Gradient w.r.t inputs
        input_grads = torch.zeros_like(inputs)
        for b in range(inputs_np.shape[0]):
            for i in range(inputs_np.shape[1]):
                inp_plus = inputs_np[b].copy()
                inp_plus[i] += eps
                inp_minus = inputs_np[b].copy()
                inp_minus[i] -= eps
                
                f_plus = float(np.array(qnn.forward(inp_plus, weights_np)).flatten()[0])
                f_minus = float(np.array(qnn.forward(inp_minus, weights_np)).flatten()[0])
                input_grads[b, i] = (f_plus - f_minus) / (2 * eps)

        input_grads = input_grads * grad_output

        # Gradient w.r.t quantum weights
        weight_grads = torch.zeros_like(weights)
        for i in range(weights_np.shape[0]):
            w_plus = weights_np.copy()
            w_plus[i] += eps
            w_minus = weights_np.copy()
            w_minus[i] -= eps
            
            batch_grad = 0.0
            for b in range(inputs_np.shape[0]):
                f_plus = float(np.array(qnn.forward(inputs_np[b], w_plus)).flatten()[0])
                f_minus = float(np.array(qnn.forward(inputs_np[b], w_minus)).flatten()[0])
                batch_grad += (f_plus - f_minus) / (2 * eps)
            weight_grads[i] = batch_grad * grad_output.mean()

        return input_grads, weight_grads, None

# ── Quantum Layer as proper nn.Module ────────────────────────────────────────
class QuantumLayer(nn.Module):
    def __init__(self, n_qubits=4):
        super().__init__()
        self.n_qubits = n_qubits
        qc, x_params, w_params = create_quantum_circuit(n_qubits)
        
        self.qnn = EstimatorQNN(
            circuit=qc,
            input_params=x_params,
            weight_params=w_params,
            observables=SparsePauliOp("ZZZI"),
        )
        self.weights = nn.Parameter(torch.randn(n_qubits) * 0.01)

    def forward(self, x):
        return QuantumFunction.apply(x, self.weights, self.qnn)

# ── Improved QC-CNN Model ────────────────────────────────────────────────────
class QCCNN(nn.Module):
    def __init__(self, n_qubits=4):
        super().__init__()
        self.n_qubits = n_qubits

        self.conv = nn.Sequential(
            nn.Conv2d(1, 16, 3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(16, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.AdaptiveAvgPool2d((2,2))
        )

        # 32 * 2 * 2 = 128
        self.fc1 = nn.Linear(128, 64)
        self.fc2 = nn.Linear(64, 32)
        self.fc3 = nn.Linear(32, n_qubits, bias=False)

        self.dropout = nn.Dropout(0.3)
        self.quantum = QuantumLayer(n_qubits)

    def forward(self, x):
        # x shape: (Batch, 1, 64, 64)
        x = self.conv(x)
        x = x.view(x.size(0), -1)
        
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        
        x = self.fc3(x)
        # Scale to [-pi, pi] for quantum encoding
        x = torch.tanh(x) * torch.pi
        
        x = self.quantum(x)
        return x
