# POCS (Proof of Causality Sampling) 
| Proposal v1

## Overview
POCS (Proof of Causality Sampling) is an optimistic causal relationship-based ML sampling verification scheme built for the AI network.

The ML scenario addressed in this article is OPML with EigenAVS.

## What problem was solved by POCS
Due to the computational resources required in the ML process and the correctness verification algorithms still being based on reproducible results, using a large amount of computing power for real-time validation is economically unfeasible for AI networks. POCS optimistically records the process of ML events by leveraging causal relationships from VLC, and under set scenarios, it uses these causal relationships to challenge recorded ML events . This approach makes full use of limited challenge computing power to enhance the ability to detect malicious actors in the ML process and significantly increases the difficulty of coordinated fraud among multiple nodes.
## Architecture(EigenAVS)
![POCS](https://github.com/hetu-project/ai-coordination-layer/blob/e5f13868f4dbaf785d3e721d2c3e96d241fc6763/pocs.png)
## How POCS works
1. Worker nodes, acting as EigenAVS Operators, register with the on-chain contract and connect to the Gateway node via P2P to obtain VLC-LOG data synchronization.
   
2. AI network nodes send verification tasks to the Gateway. Distributed Dispatcher nodes quickly verify the task format and signature, record the task into the VLC-LOG based on VLC sequencing, and finally return the LOG hash to the AI network nodes.

3. Operator nodes use a sampling algorithm, combining their private keys, task digest, VLC, etc., to determine whether to verify. If verification is needed, they perform computational verification of the task details in the VLC-LOG, using GPU/TEE.

4. Upon completion of verification, Operators broadcast the sampling proof and verification proof to the Dispatcher. If the Dispatcher detects malicious nodes, it initiates the OPML challenge process for on-chain arbitration.

## Sampling Algorithm
The default sampling algorithm in POCS is a VRF based on VLC digest and task digest. The sampling ratio is determined by the number of AI network nodes and the number of Operators. This ratio can be modified in the smart contract and synchronized with all Operators.
For example, under full load, if the AI network has 1000 nodes and there are 10 Operators, the sampling ratio can be set to 10/1000 = 1%, meaning approximately 10% of tasks will be sampled.
## Two Challenge Scenarios
- Targeted verify Review of Specific Network Nodes
    
    When certain IDs are broadcast to the Dispatcher, tasks from these IDs are marked during the VLC-LOG compilation, increasing the sampling range for Operators and enhancing the sampling frequency for these IDs.

    For instance, with 1000 AI network nodes and 10 Operators, if 10 specific AI network nodes are under review, the sampling ratio for tasks from these nodes increases to 10%, resulting in nearly 100% of their tasks being sampled.


- Causal Relationship-Based Resource-Proportional verify Review

    When a task is deemed malicious, a causal relationship-based sampling review is conducted on the AI network nodes handling this task. This includes:


    - Increasing the sampling rate for a certain proportion of tasks before and after the malicious task (if any).
    - Increasing the sampling rate for tasks run by different ID nodes recorded in the VLC-LOG before and after the malicious task.

Example:

With 1000 AI network nodes and 10 Operators, if a GPU node is found malicious, the sampling rate for the 10 tasks before the malicious task increases from 1% to 10%, and the post-task sampling rate remains at 10% for a period (as set by the contract) until multiple non-malicious tasks are reviewed.

Additionally, the sampling rate for 10 tasks run by different ID nodes before and after this task in the VLC-LOG increases to 3% until 10 tasks are reviewed(as set by the contract).


## Slash conditions for Operators
- Liveness faults: When the operator misses more than three active inquiries from different Dispatchers, a commitment activity failure will occur.

- Sampling faults: When the sampling challenge conditions claimed by the operator are inconsistent with the VRF, erroneous sampling occurs, leading to a sampling failure.
