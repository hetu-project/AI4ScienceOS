# ai-coordination-layer
This repository contains all the design documents for the Hetu AI Coordination Layer (ACL).  

ACL is a protocol group, its fundamental principles include hyper-scalable verifications, interoperable ordering mechanisms for incentivization, and robust anti-censorship governance tailored for DeAI collaborations By operating within a disruptive causality framework.

## Overview
The current protocol group includes the Proof of Causal Coordination(POCC) protocol.
### POCC
POCC is the hyper-scalable verification component in the ACL protocol group, currently encompassing the following
- [Causality Sampling(POCS)](https://github.com/hetu-project/ai-coordination-layer/blob/421c7ca8d628eaa21c3ad8b85d3014502f17d262/POCC/CausalitySampling.md)
  
- Causality Watermarking(POCWM)
- Causality Personhood(POP)
- Causality Inference(POCI)

## Implementation
### POCS
Hetu has implemented the first version of POCS in the Eigenlayer AVS named AOS.
- [acl-aos-tee](https://github.com/hetu-project/acl-aos-tee)

  Run large AI models and verifiable logic clock in TEE environment.Firstly, the semantic TEE of this repository is mainly refer to aws nitro enclave for now.
  
- [acl-aos-dispatcher](https://github.com/hetu-project/acl-aos-dispatcher)

  AOS Dispatcher is a Rust-based server application that handles TEE (Trusted Execution Environment) and OPML (OPtimistic Machine Learning) requests and responses.

- [opml-opt](https://github.com/hetu-project/opml-opt)

  OPML (Optimistic Machine Learning) is an optimistic computing model that allows untrusted Operator nodes to execute inference tasks, while leveraging an on-chain dispute resolution mechanism to verify the correctness of the results. By integrating with Eigenlayer, OPML can take advantage of its distributed ledger and cryptoeconomic incentive infrastructure.

- [acl-aos-operator](https://github.com/hetu-project/acl-aos-operator)

  The AOS Operator is a role of EigenAVS.By registering with AOS on Dispatcher, the operator could service the AI inference verification task.The staker can delegate funds to an operator by Delegation Manager contract.

- [acl-aos-zkml](https://github.com/hetu-project/acl-aos-zmkl)

  AOS-ZMKL Worker is a Rust-based project that integrates zero-knowledge machine learning (ZKML) to handle cryptographic proof generation and verification for machine learning models. This worker is designed to work as part of a larger decentralized system, utilizing zero-knowledge proofs to ensure privacy and integrity in model inference and verification.The project is based on ezkl, a framework for integrating zero-knowledge proofs with machine learning models, providing a secure and verifiable method for proving model outputs without revealing sensitive data.
