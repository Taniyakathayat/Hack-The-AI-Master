"""
Seed script for PRO Lab 02: THE VANISHING CONSENSUS
Case NEX-071 — Nexora Intelligence Systems

Seeds 5 Chapters with 6 hands-on investigation questions each (Total 30 Questions)
covering Blockchain Consensus, Oracle Security, AI Vector/Model Poisoning, Validator Divergence,
and Incident Containment / Recovery.
"""

from extensions import db
from models import (
    User, Lab, Mission, MissionQuiz, Hint, Flag, Evidence, LabProgress, MissionProgress
)


def seed_vanishing_consensus():
    """Insert or update lab7 and all 30 questions across 5 chapters."""
    lab = Lab.query.get('lab7')
    if not lab:
        lab = Lab(
            id='lab7',
            name='The Vanishing Consensus',
            topic='Web3 × AI × Blockchain',
            difficulty='Pro',
        )
        db.session.add(lab)
        db.session.commit()
    else:
        lab.name = 'The Vanishing Consensus'
        lab.topic = 'Web3 × AI × Blockchain'
        lab.difficulty = 'Pro'
        db.session.commit()

    # ── Missions (5 Chapters) ────────────────────────────────────────────
    missions_data = [
        ('lab7_m1', 1, 'The Impossible Block',
         'Investigate Block #982741. Inspect synthetic price feed ORACLE-NOVA-PRICE, analyze anomalous gas spikes, verify the disputed block header, and detect the state root mismatch 0x4f8e...39b2.'),
        ('lab7_m2', 2, 'The Poisoned Signal',
         'Examine oracle gateway NEX-ORACLE-071. Uncover off-chain relayer RELAYER-09, trace the injected $4,820.50 NOVA price spike, analyze forged heartbeat pulse signatures, and identify multi-source confirmation bypass.'),
        ('lab7_m3', 3, 'The Hallucinating AI',
         'Audit MODEL-ORION consensus sentinel. Investigate how poisoned vector embeddings (EMB-VEC-9041) tricked ORION into blessing the 3000% spike as LEGITIMATE_INFLOW with 98.7% confidence.'),
        ('lab7_m4', 4, 'The Forking Path',
         'Inspect the 21-node validator cluster. Diagnose the 14:7 consensus partition between proposing node VALIDATOR-V03 (Fork-Alpha) and dissenting node VALIDATOR-V05 (Halt-B).'),
        ('lab7_m5', 5, 'The Silent Split',
         'Reconstruct the entire attack chain from oracle manipulation to consensus divergence. Execute emergency governance proposal GOV-NEX-071, slash the rogue validator, restore unified consensus, and secure the flag.'),
    ]

    for m_id, num, title, desc in missions_data:
        m = Mission.query.get(m_id)
        if not m:
            m = Mission(id=m_id, lab_id='lab7', mission_number=num, title=title, description=desc)
            db.session.add(m)
        else:
            m.title = title
            m.description = desc
            m.mission_number = num
    db.session.commit()

    # ── 30 Quizzes (6 per Mission) ─────────────────────────────────────────
    all_quizzes = [
        # Chapter 1: The Impossible Block (Web3 / Blockchain Structure)
        MissionQuiz(
            id='q_l7_1_1', mission_id='lab7_m1',
            question='What is the exact block height number that triggered the critical consensus anomaly alert?',
            answer='982741',
            explanation='Block #982741 was flagged by network monitoring for an unexpected state root transition.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_1_2', mission_id='lab7_m1',
            question='What synthetic price feed identifier is referenced in the disputed block header payload?',
            answer='ORACLE-NOVA-PRICE',
            explanation='The block header payload specifically references synthetic price feed ORACLE-NOVA-PRICE.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_1_3', mission_id='lab7_m1',
            question='What is the mismatched state root hash prefix/value recorded by dissenting validator nodes?',
            answer='0x4f8e39b2',
            explanation='Dissenting nodes recorded an unexpected state root hash 0x4f8e...39b2, conflicting with deterministic execution.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_1_4', mission_id='lab7_m1',
            question='How many validator nodes initially accepted the disputed block before the anomaly halt?',
            answer='14',
            explanation='14 out of 21 validator nodes accepted the block following AI validation blessing.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_1_5', mission_id='lab7_m1',
            question='Which proposing validator node packaged and broadcasted Block #982741?',
            answer='VALIDATOR-V03',
            explanation='VALIDATOR-V03 served as the proposing slot leader that packaged the disputed block.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_1_6', mission_id='lab7_m1',
            question='What was the execution anomaly flagged regarding block gas consumption?',
            answer='EXCEEDED',
            explanation='The execution gas limit was marked as EXCEEDED due to non-standard synthetic oracle state expansions.',
            xp_reward=50
        ),

        # Chapter 2: The Poisoned Signal (Oracle & Web3 Feeds)
        MissionQuiz(
            id='q_l7_2_1', mission_id='lab7_m2',
            question='What is the identifier of the compromised oracle telemetry gateway?',
            answer='NEX-ORACLE-071',
            explanation='Gateway NEX-ORACLE-071 ingested the untrusted off-chain telemetry without multi-peer quorum.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_2_2', mission_id='lab7_m2',
            question='What was the manipulated settlement price injected for the NOVA asset in USD?',
            answer='4820.50',
            explanation='The attacker injected a manipulated price of $4,820.50 USD (a >3000% artificial surge).',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_2_3', mission_id='lab7_m2',
            question='What was the actual legitimate spot market price of NOVA prior to the malicious injection?',
            answer='142.10',
            explanation='The legitimate spot market price across verified decentralized exchanges was $142.10 USD.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_2_4', mission_id='lab7_m2',
            question='Which rogue off-chain relayer node transmitted the forged heartbeat pulse?',
            answer='RELAYER-09',
            explanation='RELAYER-09 forwarded the unverified price heartbeat payload into the oracle aggregation pipeline.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_2_5', mission_id='lab7_m2',
            question='How many peer confirmation signatures were skipped due to the emergency fast-path bypass?',
            answer='5',
            explanation='5 quorum confirmation signatures were bypassed by leveraging an unauthenticated emergency fast-path routine.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_2_6', mission_id='lab7_m2',
            question='What signature verification status was logged on the manipulated telemetry packet?',
            answer='VALID_FORGED',
            explanation='The signature was logged as VALID_FORGED due to compromised relayer signing keys.',
            xp_reward=50
        ),

        # Chapter 3: The Hallucinating AI (AI Security & Model Drift)
        MissionQuiz(
            id='q_l7_3_1', mission_id='lab7_m3',
            question='What AI sentinel engine is responsible for real-time consensus anomaly filtering?',
            answer='MODEL-ORION',
            explanation='MODEL-ORION (ORION-V3 Sentinel) evaluates on-chain risk telemetry for the validator cluster.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_3_2', mission_id='lab7_m3',
            question='What classification label did MODEL-ORION assign to the poisoned 3000% price spike?',
            answer='LEGITIMATE_INFLOW',
            explanation='The model misclassified the abnormal spike as a LEGITIMATE_INFLOW of institutional liquidity.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_3_3', mission_id='lab7_m3',
            question='What confidence score percentage did MODEL-ORION report for the malicious transaction?',
            answer='98.7',
            explanation='MODEL-ORION returned a 98.7% confidence rating, bypassing secondary human and automated alerts.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_3_4', mission_id='lab7_m3',
            question='What poisoned vector embedding dataset cluster was identified in ORION cache buffer?',
            answer='EMB-VEC-9041',
            explanation='Cluster EMB-VEC-9041 contained adversarial vector embeddings simulating historical liquidity surges.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_3_5', mission_id='lab7_m3',
            question='What critical safety threshold parameter was overridden by the biased model output?',
            answer='VOLATILITY_THRESHOLD',
            explanation='The VOLATILITY_THRESHOLD circuit breaker was suppressed due to the high AI confidence output.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_3_6', mission_id='lab7_m3',
            question='How many seconds did the corrupted AI model delay the automated validator halt alert?',
            answer='180',
            explanation='The alert was suppressed for 180 seconds (3 minutes), giving the proposing node time to broadcast the block.',
            xp_reward=50
        ),

        # Chapter 4: The Forking Path (Consensus & Validator Divergence)
        MissionQuiz(
            id='q_l7_4_1', mission_id='lab7_m4',
            question='Which dissenting validator node halted execution and rejected Block #982741?',
            answer='VALIDATOR-V05',
            explanation='VALIDATOR-V05 detected state root divergence during deterministic EVM execution and halted.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_4_2', mission_id='lab7_m4',
            question='What was the consensus split ratio between accepting nodes and dissenting nodes?',
            answer='14:7',
            explanation='14 nodes followed proposing leader VALIDATOR-V03 while 7 nodes halted with VALIDATOR-V05.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_4_3', mission_id='lab7_m4',
            question='What consensus protocol algorithm failed to reach single-slot mathematical finality?',
            answer='BFT-POS',
            explanation='The Byzantine Fault Tolerant Proof-of-Stake (BFT-POS) consensus engine was partitioned.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_4_4', mission_id='lab7_m4',
            question='What is the identifier of the rogue partitioned state ledger fork?',
            answer='FORK-ALPHA-071',
            explanation='The corrupted chain branch was designated as FORK-ALPHA-071 in network telemetry.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_4_5', mission_id='lab7_m4',
            question='What fundamental consensus safety guarantee was breached during the partition?',
            answer='SAFETY_VIOLATION',
            explanation='A SAFETY_VIOLATION occurred because two conflicting state roots received validator attestation.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_4_6', mission_id='lab7_m4',
            question='How many total NXR tokens were at immediate risk of double-spending during the split?',
            answer='2500000',
            explanation='2,500,000 NXR in bridge collateral was at immediate risk of double-spend arbitrage.',
            xp_reward=50
        ),

        # Chapter 5: The Silent Split (Forensics, Containment & Recovery)
        MissionQuiz(
            id='q_l7_5_1', mission_id='lab7_m5',
            question='What was the root cause attack vector of the entire consensus crisis?',
            answer='ORACLE_POISONING_AI_CORRUPTION',
            explanation='The attack coupled off-chain oracle manipulation with adversarial AI vector poisoning.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_5_2', mission_id='lab7_m5',
            question='Which emergency governance proposal ID was executed to slash the rogue proposing node?',
            answer='GOV-NEX-071',
            explanation='Proposal GOV-NEX-071 slashed VALIDATOR-V03 and revoked RELAYER-09 keys.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_5_3', mission_id='lab7_m5',
            question='What cryptographic evidence tag confirmed the validator state divergence?',
            answer='CONSENSUS-E14',
            explanation='Evidence item CONSENSUS-E14 documented the exact state root mismatch and partition telemetry.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_5_4', mission_id='lab7_m5',
            question='What recovery procedure was applied to synchronize the halted validators and prune the fork?',
            answer='STATE_ROLLBACK_REPLAY',
            explanation='The network executed STATE_ROLLBACK_REPLAY to roll back Block #982741 and replay clean state.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_5_5', mission_id='lab7_m5',
            question='What is the final state verification hash confirming unified consensus recovery?',
            answer='0x98a2e71c',
            explanation='The post-recovery unified state root hash was mathematically confirmed as 0x98a2...e71c across all 21 nodes.',
            xp_reward=50
        ),
        MissionQuiz(
            id='q_l7_5_6', mission_id='lab7_m5',
            question='Submit the master root investigation containment flag to close Case NEX-071.',
            answer='NEXORA{v4n1sh1ng_c0ns3nsus_n3x071}',
            explanation='Master Flag: NEXORA{v4n1sh1ng_c0ns3nsus_n3x071}. Consensus restored and verified.',
            xp_reward=100
        ),
    ]

    # Delete existing lab7 quizzes and re-add all 30
    mission_ids = ['lab7_m1', 'lab7_m2', 'lab7_m3', 'lab7_m4', 'lab7_m5']
    MissionQuiz.query.filter(MissionQuiz.mission_id.in_(mission_ids)).delete(synchronize_session=False)
    for q in all_quizzes:
        db.session.add(q)
    db.session.commit()

    # ── Hints ────────────────────────────────────────────────────────────
    Hint.query.filter(Hint.mission_id.in_(mission_ids)).delete(synchronize_session=False)
    hints = [
        # Chapter 1
        Hint(id='h_l7_1_1', mission_id='lab7_m1',
             hint_text='Open the Blockchain Inspector or run `block 982741` in Terminal to check the target block height (982741).',
             xp_cost=0, sort_order=1),
        Hint(id='h_l7_1_2', mission_id='lab7_m1',
             hint_text='Check the Block Header telemetry payload for the oracle feed tag: ORACLE-NOVA-PRICE.',
             xp_cost=5, sort_order=2),
        Hint(id='h_l7_1_3', mission_id='lab7_m1',
             hint_text='Inspect the State Root Diff tab or run `diff-state 982741` for the hash 0x4f8e39b2.',
             xp_cost=5, sort_order=3),
        Hint(id='h_l7_1_4', mission_id='lab7_m1',
             hint_text='Check the validator acceptance vote count in Consensus Telemetry (14 accepted out of 21).',
             xp_cost=5, sort_order=4),
        Hint(id='h_l7_1_5', mission_id='lab7_m1',
             hint_text='Inspect the Proposing Leader field in Block #982741: VALIDATOR-V03.',
             xp_cost=5, sort_order=5),
        Hint(id='h_l7_1_6', mission_id='lab7_m1',
             hint_text='Check the Gas Status field in block telemetry: EXCEEDED.',
             xp_cost=5, sort_order=6),

        # Chapter 2
        Hint(id='h_l7_2_1', mission_id='lab7_m2',
             hint_text='Open the Oracle Telemetry tab or run `oracle NEX-ORACLE-071` in Terminal.',
             xp_cost=10, sort_order=1),
        Hint(id='h_l7_2_2', mission_id='lab7_m2',
             hint_text='Look at the Injected Settlement Price in `oracle-audit.txt` ($4820.50 USD).',
             xp_cost=10, sort_order=2),
        Hint(id='h_l7_2_3', mission_id='lab7_m2',
             hint_text='Check the Spot DEX Baseline Price in oracle telemetry ($142.10 USD).',
             xp_cost=10, sort_order=3),
        Hint(id='h_l7_2_4', mission_id='lab7_m2',
             hint_text='Check the Relayer Node ID in the packet header: RELAYER-09.',
             xp_cost=10, sort_order=4),
        Hint(id='h_l7_2_5', mission_id='lab7_m2',
             hint_text='Inspect the Quorum Verification log: 5 peer signatures were skipped.',
             xp_cost=10, sort_order=5),
        Hint(id='h_l7_2_6', mission_id='lab7_m2',
             hint_text='Check the Signature Validation flag: VALID_FORGED.',
             xp_cost=10, sort_order=6),

        # Chapter 3
        Hint(id='h_l7_3_1', mission_id='lab7_m3',
             hint_text='Open AI Sentinel tab or run `ai-audit MODEL-ORION` in Terminal.',
             xp_cost=15, sort_order=1),
        Hint(id='h_l7_3_2', mission_id='lab7_m3',
             hint_text='Look at the Model Decision output: LEGITIMATE_INFLOW.',
             xp_cost=15, sort_order=2),
        Hint(id='h_l7_3_3', mission_id='lab7_m3',
             hint_text='Check the Model Confidence metric: 98.7%.',
             xp_cost=15, sort_order=3),
        Hint(id='h_l7_3_4', mission_id='lab7_m3',
             hint_text='Inspect the Vector Embedding Cluster in `ai-weights-diff.json`: EMB-VEC-9041.',
             xp_cost=15, sort_order=4),
        Hint(id='h_l7_3_5', mission_id='lab7_m3',
             hint_text='Check the bypassed safety circuit parameter: VOLATILITY_THRESHOLD.',
             xp_cost=15, sort_order=5),
        Hint(id='h_l7_3_6', mission_id='lab7_m3',
             hint_text='Check the Alert Suppression Timer: 180 seconds.',
             xp_cost=15, sort_order=6),

        # Chapter 4
        Hint(id='h_l7_4_1', mission_id='lab7_m4',
             hint_text='Open the Validator Topology graph or run `validator VALIDATOR-V05` in Terminal.',
             xp_cost=20, sort_order=1),
        Hint(id='h_l7_4_2', mission_id='lab7_m4',
             hint_text='Check the active cluster split ratio: 14:7.',
             xp_cost=20, sort_order=2),
        Hint(id='h_l7_4_3', mission_id='lab7_m4',
             hint_text='Check the consensus engine type: BFT-POS.',
             xp_cost=20, sort_order=3),
        Hint(id='h_l7_4_4', mission_id='lab7_m4',
             hint_text='Inspect the Partition Branch Tag: FORK-ALPHA-071.',
             xp_cost=20, sort_order=4),
        Hint(id='h_l7_4_5', mission_id='lab7_m4',
             hint_text='Check the Consensus Violation Alert: SAFETY_VIOLATION.',
             xp_cost=20, sort_order=5),
        Hint(id='h_l7_4_6', mission_id='lab7_m4',
             hint_text='Look at the Bridge Collateral At Risk metric: 2,500,000 NXR (2500000).',
             xp_cost=20, sort_order=6),

        # Chapter 5
        Hint(id='h_l7_5_1', mission_id='lab7_m5',
             hint_text='Open the Attack Graph or read `incident-summary.txt`: ORACLE_POISONING_AI_CORRUPTION.',
             xp_cost=25, sort_order=1),
        Hint(id='h_l7_5_2', mission_id='lab7_m5',
             hint_text='Check the Emergency Governance Proposal ID: GOV-NEX-071.',
             xp_cost=25, sort_order=2),
        Hint(id='h_l7_5_3', mission_id='lab7_m5',
             hint_text='Look at the Evidence Vault for validator divergence: CONSENSUS-E14.',
             xp_cost=25, sort_order=3),
        Hint(id='h_l7_5_4', mission_id='lab7_m5',
             hint_text='Check the synchronization playbook action: STATE_ROLLBACK_REPLAY.',
             xp_cost=25, sort_order=4),
        Hint(id='h_l7_5_5', mission_id='lab7_m5',
             hint_text='Inspect the Post-Recovery Root in recovery-log.txt: 0x98a2e71c.',
             xp_cost=25, sort_order=5),
        Hint(id='h_l7_5_6', mission_id='lab7_m5',
             hint_text='The master flag is displayed in the recovery terminal: NEXORA{v4n1sh1ng_c0ns3nsus_n3x071}.',
             xp_cost=25, sort_order=6),
    ]
    db.session.add_all(hints)
    db.session.commit()

    # ── Evidence ─────────────────────────────────────────────────────────
    Evidence.query.filter_by(lab_id='lab7').delete(synchronize_session=False)
    evidence = [
        Evidence(id='e_l7_01', lab_id='lab7',
                 name='WEB3-E11: Disputed Block Header #982741',
                 description='Block #982741 proposed by VALIDATOR-V03 referencing ORACLE-NOVA-PRICE with state root mismatch 0x4f8e39b2.'),
        Evidence(id='e_l7_02', lab_id='lab7',
                 name='ORACLE-E12: Poisoned Price Telemetry NEX-ORACLE-071',
                 description='Manipulated $4,820.50 price surge injected via RELAYER-09 with bypassed 5-peer signature quorum.'),
        Evidence(id='e_l7_03', lab_id='lab7',
                 name='AI-E13: MODEL-ORION Corrupted Vector Embeddings',
                 description='Adversarial vector cluster EMB-VEC-9041 biased ORION sentinel to classify spike as LEGITIMATE_INFLOW (98.7%).'),
        Evidence(id='e_l7_04', lab_id='lab7',
                 name='CONSENSUS-E14: Validator Divergence Log & Fork Alpha',
                 description='Consensus partition 14:7 between Fork-Alpha (VALIDATOR-V03) and Halt-B (VALIDATOR-V05) risking 2.5M NXR.'),
        Evidence(id='e_l7_05', lab_id='lab7',
                 name='GOV-E15: Slashing Proposal GOV-NEX-071 Execution',
                 description='Governance action GOV-NEX-071 executed: VALIDATOR-V03 slashed, state rolled back, unified root 0x98a2e71c confirmed.'),
    ]
    db.session.add_all(evidence)

    # ── Flag ─────────────────────────────────────────────────────────────
    Flag.query.filter_by(lab_id='lab7').delete(synchronize_session=False)
    flag = Flag(
        id='f7', lab_id='lab7',
        flag_value='NEXORA{v4n1sh1ng_c0ns3nsus_n3x071}'
    )
    db.session.add(flag)
    db.session.commit()

    # Initialize progress for all existing users
    users = User.query.all()
    missions = Mission.query.filter_by(lab_id='lab7').order_by(Mission.mission_number.asc()).all()
    for user in users:
        lp = LabProgress.query.filter_by(user_id=user.id, lab_id='lab7').first()
        if not lp:
            lp = LabProgress(user_id=user.id, lab_id='lab7', status='AVAILABLE')
            db.session.add(lp)
        for i, mission in enumerate(missions):
            mp = MissionProgress.query.filter_by(user_id=user.id, mission_id=mission.id).first()
            if not mp:
                status = 'AVAILABLE' if i == 0 else 'LOCKED'
                mp = MissionProgress(user_id=user.id, lab_id='lab7', mission_id=mission.id, status=status)
                db.session.add(mp)
    db.session.commit()

    print("Seeded PRO Lab 02: THE VANISHING CONSENSUS (lab7) with 30 hands-on questions.")


if __name__ == '__main__':
    from app import app
    with app.app_context():
        seed_vanishing_consensus()
