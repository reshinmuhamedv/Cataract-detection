
import torch
import torch.nn as nn
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit_aer import Aer
from qiskit_machine_learning.neural_networks import SamplerQNN
from qiskit_machine_learning.connectors import TorchConnector

def create_quantum_layer():
    n_qubits = 4
    x_params = ParameterVector("x", n_qubits)
    w_params = ParameterVector("w", n_qubits)

    qc = QuantumCircuit(n_qubits)
    
    # Feature encoding
    for i in range(n_qubits):
        qc.ry(x_params[i], i)

    # Variational part
    for i in range(n_qubits):
        qc.rx(w_params[i], i)
        qc.rz(w_params[i], i)

    # Entanglement
    for i in range(n_qubits - 1):
        qc.cx(i, i + 1)

    # Create QNN
    qnn = SamplerQNN(
        circuit=qc,
        input_params=x_params,
        weight_params=w_params,
        interpret=lambda x: x % 2,
        output_shape=2,
    )

    return TorchConnector(qnn)

class QCCNN(nn.Module):
    def __init__(self):
        super().__init__()

        self.conv = nn.Sequential(
            nn.Conv2d(1, 8, 3),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(8, 16, 3),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )

        # 16 * 14 * 14 = 3136
        self.fc1 = nn.Linear(3136, 128)
        self.fc2 = nn.Linear(128, 32)
        self.fc3 = nn.Linear(32, 4)

        self.quantum = create_quantum_layer()
        
        self.classifier = nn.Linear(2, 1)

    def forward(self, x):
        # x shape: (Batch, 1, 64, 64)
        x = self.conv(x)
        x = x.view(x.size(0), -1)

        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        x = torch.relu(self.fc3(x))

        x = torch.tanh(x)
        x = self.quantum(x)
        x = self.classifier(x)

        return x
