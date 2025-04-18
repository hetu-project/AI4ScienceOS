# POCS
POCS (Proof of Causality Sampling) is an optimistic causal relationship-based ML sampling verification scheme built for the AI network.It is designed to verify the correctness of machine learning models without revealing sensitive data and more efficiently.

For more information, please refer to the [POCS DOC](https://docs.hetu.org/aos-network).

## Protocol
POCS protocol is a protocol that allows users to verify the correctness of machine learning models without revealing sensitive data. The protocol is designed to be secure and efficient, and it is based on the following assumptions:
- The model is correct
- The input is not modified
- The output should be consistent with different sampling methods
- The TEE verification is correct

### POCS Flow
- [Causality Sampling(POCS)]()

### Implementation
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

- [acl-aos-vrfcontract](https://github.com/hetu-project/acl-aos-vrfcontract)

  POCS VRF range contract of Aos network.

- [acl-aos-challenge](https://github.com/hetu-project/acl-aos-challenge)

  Challenger of EigenAVS.
