
import numpy as np
import torch
import torch.nn as nn
import pennylane as qml

# Number of qubits in the quantum circuit
N_QUBITS = 4
# Number of variational layers in the quantum circuit
N_LAYERS = 2

# Create the quantum device (simulator)
dev = qml.device("default.qubit", wires=N_QUBITS)

@qml.qnode(dev, interface="torch")
def quantum_circuit(inputs, weights):
    """
    Parameterized quantum circuit for feature enhancement.
    """
    # Amplitude encoding: encode classical features into quantum state
    # Inputs must be normalized for AmplitudeEmbedding
    qml.AmplitudeEmbedding(inputs, wires=range(N_QUBITS), normalize=True)

    # Variational quantum circuit with multiple layers
    for layer in range(N_LAYERS):
        # Single-qubit rotation gates (trainable)
        for i in range(N_QUBITS):
            qml.RY(weights[layer, i], wires=i)

        # Entanglement layer using CNOT gates (ring topology)
        for i in range(N_QUBITS):
            qml.CNOT(wires=[i, (i + 1) % N_QUBITS])

    # Measurement: expectation value of Pauli-Z on each qubit
    return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]

class QuantumLayer(nn.Module):
    """
    A PyTorch-compatible quantum layer that wraps the PennyLane quantum circuit.
    """
    def __init__(self, n_qubits=N_QUBITS, n_layers=N_LAYERS):
        super(QuantumLayer, self).__init__()
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        
        # Initialize trainable weights
        self.quantum_weights = nn.Parameter(
            torch.rand(n_layers, n_qubits) * 2 * np.pi
        )

    def forward(self, x):
        """
        Process each sample in the batch through the quantum circuit.
        """
        # x shape: (batch_size, 16)
        batch_size = x.shape[0]
        
        # Apply the circuit to each sample
        # PennyLane's Torch interface supports batching if the qnode is written for it,
        # but for safety and consistency with the Keras implementation's map_fn,
        # we can iterate or use qml.qnn.TorchLayer if we wanted a higher-level API.
        # Let's use the explicit approach.
        
        outputs = []
        for i in range(batch_size):
            # Pass individual sample and shared weights
            res = quantum_circuit(x[i], self.quantum_weights)
            outputs.append(torch.stack(res))
            
        return torch.stack(outputs).float()
