# 🏛️ System Architecture Diagrams

This file contains the high-level architecture models for the decentralized escrow and dispute system

---

## 1. Bloom State Machine

This diagram shows the complete lifecycle of a deal, from creation to resolution. It models the core logic of the smart contracts and defines all possible states.

```mermaid
stateDiagram-v2
    %% 1. Define vibrant styles for states
    classDef stateDefault fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px,color:#0d47a1,font-weight:bold
    classDef stateActive fill:#e8eaf6,stroke:#303f9f,stroke-width:2px,color:#303f9f,font-weight:bold
    classDef stateSuccess fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20,font-weight:bold
    classDef stateFail fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c,font-weight:bold

    %% 2. Define the flow
    [*] --> Created: createDeal()

    Created --> Acknowledged: acknowledgeDeal()
    Created --> Refunded: cancelDeal()

    Acknowledged --> Released: releaseFunds()
    Acknowledged --> InDispute: openDispute()

    InDispute --> Voting: jurorsSelected()
    Voting --> Resolved: executeVerdict()

    Resolved --> Appeal: appeal()
    Resolved --> Released: finalize(Release)
    Resolved --> Refunded: finalize(Refund)

    Appeal --> Voting: startAppealRound()

    Released --> [*]
    Refunded --> [*]

    %% 3. Apply styles to states
    class Created,Acknowledged stateDefault
    class InDispute,Voting,Resolved,Appeal stateActive
    class Released stateSuccess
    class Refunded stateFail

    %% 4. Style the arrows (links) based on their order
    %% Note: Links are 0-indexed
    style 2 stroke:#c62828,stroke-width:2px,stroke-dasharray: "5 5"
    style 3 stroke:#2e7d32,stroke-width:2px
    style 4 stroke:#e65100,stroke-width:2px
    style 8 stroke:#2e7d32,stroke-width:2px
    style 9 stroke:#c62828,stroke-width:2px,stroke-dasharray: "5 5"

```

## 1. Use Case Diagram

This diagram shows the complete lifecycle of a deal, from creation to resolution. It models the core logic of the `Escrow.sol` and `Dispute.sol` smart contracts and defines all possible states.

```mermaid

graph TD
    %% Define styles
    classDef userActor fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20,font-weight:bold
    classDef systemActor fill:#e3f2fd,stroke:#0d47a1,color:#0d47a1,font-weight:bold
    classDef useCase fill:#f5f5f5,stroke:#616161,color:#212121,font-weight:bold

    %% Define Actors
    subgraph "Actors"
        A[Initiator]
        B[Counterparty]
        C[Juror]
        S[System - Smart Contract]
    end

    %% Define Use Cases
    subgraph "Use Cases"
        %% Initiator Cases
        U1(Create Deal)
        U2(Cancel Deal)
        U3(Release Funds)

        %% Counterparty Cases
        U4(Acknowledge Deal)

        %% Shared Cases
        U5(Open Dispute)
        U6(Submit Evidence)
        U7(Appeal)

        %% Juror Cases
        U8(Register Juror)
        U9(Vote)

        %% System Cases
        S1(Select Juror)
        S2(Finalize Deal)
        S3(Resolve Dispute)
    end

    %% Link Actors to Use Cases
    A --- U1
    A --- U2
    A --- U3
    A --- U5
    A --- U6
    A --- U7

    B --- U4
    B --- U5
    B --- U6
    B --- U7

    C --- U8
    C --- U9

    S --- S1
    S --- S2
    S --- S3

    %% Apply Styles
    class A,B,C userActor
    class S systemActor
    class U1,U2,U3,U4,U5,U6,U7,U8,U9,S1,S2,S3 useCase


```


```mermaid
sequenceDiagram
    %% Define Participants
    actor Initiator
    actor Juror
    actor Automation
    participant BloomEscrow
    participant DisputeManager
    participant DisputeStorage
    participant VRFWrapper
    

    %% --- 1. Dispute is Opened ---
    Note over Initiator: (Assumed) Initiator or Counterparty opens dispute.
    Initiator->>DisputeManager: selectJurors(disputeId)
    activate DisputeManager
    DisputeManager->>DisputeStorage: Read pools & config
    DisputeManager->>VRFWrapper: requestRandomness()
    
    Note right of VRFWrapper: Chainlink VRF returns randomness
    VRFWrapper-->>DisputeManager: fulfillRandomWords(rand)
    
    DisputeManager->>DisputeManager: _selectJurors(rand)
    DisputeManager->>DisputeStorage: updateDisputeJurors(list)
    DisputeManager->>DisputeStorage: updateDisputeTimer()
    DisputeManager->>BloomEscrow: updateStatus(id, InDispute)
    deactivate DisputeManager
    
    %% --- 2. Jurors Vote ---
    loop Jurors Vote
        Juror->>DisputeManager: vote(disputeId, support)
        activate DisputeManager
        DisputeManager->>DisputeStorage: _validateTimeStamp()
        DisputeManager->>DisputeStorage: updateDisputeVote(...)
        deactivate DisputeManager
    end
    
    %% --- 3. Dispute is Finalized by Automation ---
    Note right of Automation: Chainlink Automation calls upkeep
    Automation->>DisputeManager: performUpkeep(...)
    activate DisputeManager
    DisputeManager->>DisputeManager: _finishDispute(disputeId)
    activate DisputeManager
    DisputeManager->>DisputeStorage: getAllDisputeVotes()
    DisputeManager->>DisputeManager: _determineWinner()
    Note over DisputeManager: (Winner is 'winnerAddress')
    DisputeManager->>DisputeManager: _distributeRewardAndReputation()
    DisputeManager->>DisputeStorage: (Slash/Reward/Reputation update)
    DisputeManager->>DisputeStorage: updateDisputeWinner(winnerAddress)
    deactivate DisputeManager
    
    %% --- 4. Funds are Released ---
    DisputeManager->>BloomEscrow: releaseFunds(winnerAddress, dealId)
    activate BloomEscrow
    BloomEscrow->>BloomEscrow: (Transfer funds to winner)
    BloomEscrow->>BloomEscrow: update deal status to Resolved
    BloomEscrow-->>DisputeManager: (success)
    deactivate BloomEscrow
    deactivate DisputeManager

```

```mermaid
sequenceDiagram
    %% Define Participants
    actor Initiator
    actor Counterparty
    participant BloomEscrow
    

    %% --- 1. Deal is Created ---
    Note over Initiator: Initiator has already approved tokens.
    Initiator->>BloomEscrow: createDeal(...)
    activate BloomEscrow
    BloomEscrow->>BloomEscrow: (TransferFrom tokens)
    BloomEscrow->>BloomEscrow: Store new deal
    BloomEscrow->>BloomEscrow: Set status: Pending
    BloomEscrow-->>Initiator: (Success)
    deactivate BloomEscrow

    %% --- 2. Deal is Acknowledged ---
    Counterparty->>BloomEscrow: acknowledgeDeal(id)
    activate BloomEscrow
    BloomEscrow->>BloomEscrow: Check status == Pending
    BloomEscrow->>BloomEscrow: Set status: Acknowledged
    BloomEscrow-->>Counterparty: (Success)
    deactivate BloomEscrow

    %% --- 3. Funds are Released ---
    Initiator->>BloomEscrow: finalizeDeal(id)
    activate BloomEscrow
    BloomEscrow->>BloomEscrow: Check status == Acknowledged
    BloomEscrow->>BloomEscrow: Set status: Completed
    BloomEscrow->>BloomEscrow: (Transfer funds to Counterparty)
    BloomEscrow-->>Initiator: (Success)
    deactivate BloomEscrow

```