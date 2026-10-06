from extensions import db
from models import MissionQuiz, QuizAttempt, MissionProgress, LabProgress, Mission, EvidenceProgress

def evaluate_quiz(user_id, lab_id, mission_id, answer, question_id=None):
    """
    Evaluates a quiz answer against the database.
    Supports individual sub-questions (25 questions total across 5 chapters).
    Returns (success, message, xp_awarded, extra_data)
    """
    # Find the target quiz
    if question_id:
        quiz = MissionQuiz.query.filter_by(id=question_id).first()
    else:
        # Fallback to first uncompleted or first quiz for this mission
        quizzes = MissionQuiz.query.filter_by(mission_id=mission_id).order_by(MissionQuiz.id.asc()).all()
        quiz = quizzes[0] if quizzes else None

    if not quiz:
        return False, "No quiz found for this mission.", 0, {}

    user_raw = answer.strip().lower()
    target_raw = quiz.answer.strip().lower()

    user_clean = user_raw.replace('%', '').replace('_', ' ').replace('-', ' ').strip()
    target_clean = target_raw.replace('%', '').replace('_', ' ').replace('-', ' ').strip()

    user_nospace = ''.join(c for c in user_clean if c.isalnum())
    target_nospace = ''.join(c for c in target_clean if c.isalnum())

    correct = (
        (user_clean == target_clean) or 
        (user_raw == target_raw) or 
        (bool(user_nospace) and user_nospace == target_nospace)
    )
    
    # Context-aware flexible fuzzy matching
    if not correct:
        if 'modify' in target_clean and 'wallet' in target_clean and ('modify' in user_clean and 'wallet' in user_clean):
            correct = True
        elif target_clean == 'unknown' and 'unknown' in user_clean:
            correct = True
        elif target_clean in ['95', '95%'] and ('95' in user_clean):
            correct = True
        elif 'orion' in target_clean and 'nexus' in target_clean and ('orion' in user_clean and 'nexus' in user_clean):
            correct = True
        elif 'nif' in target_clean and '2038' in target_clean and ('nif' in user_clean and '2038' in user_clean):
            correct = True
        elif '82400' in target_clean and ('82400' in user_clean or '82,400' in user_clean):
            correct = True
        elif 'bridge' in target_clean and 'core' in target_clean and ('bridge' in user_clean and 'core' in user_clean and '04' in user_clean):
            correct = True
        elif 'adv' in target_clean and 'convergence' in target_clean and ('convergence' in user_clean or 'adv' in user_clean):
            correct = True
        elif 'human' in target_clean and 'approval' in target_clean and ('human' in user_clean or 'multisig' in user_clean or 'multi sig' in user_clean):
            correct = True
        elif 'nex' in target_clean and 'sess' in target_clean and ('994' in user_clean):
            correct = True
        elif '0x9f4a1c78' in target_clean and ('9f4a1c78' in user_clean):
            correct = True
        elif 'pol' in target_clean and 'settle' in target_clean and ('settle' in user_clean or 'treasury' in user_clean):
            correct = True
        elif 'automated' in target_clean and 'signer' in target_clean and ('signer' in user_clean or 'broker' in user_clean):
            correct = True
        elif 'liquidity' in target_clean and 'pool' in target_clean and ('liquidity' in user_clean or 'pool' in user_clean):
            correct = True
        elif 'oracle' in target_clean and 'poison' in target_clean and ('oracle' in user_clean or 'poison' in user_clean):
            correct = True
        elif 'relayer' in target_clean and '09' in target_clean and ('relayer' in user_clean and '09' in user_clean):
            correct = True
        elif 'legitimate' in target_clean and 'inflow' in target_clean and ('inflow' in user_clean or 'legitimate' in user_clean):
            correct = True
        elif 'validator' in target_clean and 'v05' in target_clean and ('v05' in user_clean or 'validator' in user_clean):
            correct = True
        elif 'validator' in target_clean and 'v03' in target_clean and ('v03' in user_clean or 'validator' in user_clean):
            correct = True
        elif 'emb' in target_clean and '9041' in target_clean and ('9041' in user_clean):
            correct = True
        elif 'gov' in target_clean and '071' in target_clean and ('gov' in user_clean and '071' in user_clean):
            correct = True
        elif '4820' in target_clean and ('4820' in user_clean or '4,820' in user_clean):
            correct = True
        elif '142' in target_clean and ('142' in user_clean or '142.10' in user_clean):
            correct = True
        elif '2500000' in target_clean and ('2500000' in user_clean or '2.5m' in user_clean or '2,500,000' in user_clean):
            correct = True
        elif '0x4f8e' in target_clean and ('4f8e' in user_clean):
            correct = True
        elif '0x98a2' in target_clean and ('98a2' in user_clean):
            correct = True
        elif 'bft' in target_clean and ('bft' in user_clean or 'pos' in user_clean):
            correct = True
            
    # Record attempt using quiz.id as identifier in the attempt log
    attempt = QuizAttempt(user_id=user_id, mission_id=quiz.id, answer=answer, correct=correct)
    db.session.add(attempt)
    
    if not correct:
        db.session.commit()
        # Helpful guidance
        if '0x7c41' in user_clean:
            return False, "Target address detected! The question is asking for the on-chain status (e.g. UNKNOWN).", 0, {'quiz_id': quiz.id}
        if 'orion-dec' in user_clean and 'nif' not in user_clean:
            return False, "That's the decision ID! What was the specific intelligence reference code (starts with NIF-)?", 0, {'quiz_id': quiz.id}
        if 'intel-ingestor' in user_clean and 'modify' not in user_clean:
            return False, "That's the microservice name! What unauthorized permission was assigned to it?", 0, {'quiz_id': quiz.id}
        return False, "Incorrect finding. Inspect the investigator clues in Terminal or DevTools and try again.", 0, {'quiz_id': quiz.id}
    
    # Award XP for this specific question
    xp = quiz.xp_reward or 50
    lab_prog = LabProgress.query.filter_by(user_id=user_id, lab_id=lab_id).first()
    if lab_prog:
        lab_prog.score = (lab_prog.score or 0) + xp
        db.session.add(lab_prog)

    # Check how many quizzes exist for this mission and how many user has completed
    all_mission_quizzes = MissionQuiz.query.filter_by(mission_id=mission_id).order_by(MissionQuiz.id.asc()).all()
    quiz_ids = [q.id for q in all_mission_quizzes]
    
    solved_quiz_ids = {
        qa.mission_id for qa in QuizAttempt.query.filter(
            QuizAttempt.user_id == user_id,
            QuizAttempt.mission_id.in_(quiz_ids),
            QuizAttempt.correct == True
        ).all()
    }
    solved_quiz_ids.add(quiz.id)

    mission_completed = len(solved_quiz_ids) >= len(all_mission_quizzes)
    
    if mission_completed:
        mission_prog = MissionProgress.query.filter_by(user_id=user_id, mission_id=mission_id).first()
        if not mission_prog:
            mission_prog = MissionProgress(user_id=user_id, lab_id=lab_id, mission_id=mission_id, status='COMPLETED')
        else:
            mission_prog.status = 'COMPLETED'
        db.session.add(mission_prog)

        # Unlock next mission
        _unlock_next_mission(user_id, lab_id, mission_id)

        # Auto-collect cryptographic evidence
        _collect_evidence_for_mission(user_id, lab_id, mission_id)
            
        db.session.commit()
        return True, f"🎉 All {len(all_mission_quizzes)} investigation objectives verified for this chapter! Evidence secured.", xp, {
            'quiz_id': quiz.id,
            'mission_completed': True,
            'solved_count': len(solved_quiz_ids),
            'total_count': len(all_mission_quizzes),
            'explanation': quiz.explanation
        }
    
    db.session.commit()
    return True, f"✓ Objective verified! ({len(solved_quiz_ids)}/{len(all_mission_quizzes)} complete)", xp, {
        'quiz_id': quiz.id,
        'mission_completed': False,
        'solved_count': len(solved_quiz_ids),
        'total_count': len(all_mission_quizzes),
        'explanation': quiz.explanation
    }


def _unlock_next_mission(user_id, lab_id, mission_id):
    """Unlocks the next sequential mission in the lab."""
    current_mission = Mission.query.get(mission_id)
    if not current_mission:
        return
    next_m = Mission.query.filter_by(
        lab_id=lab_id,
        mission_number=current_mission.mission_number + 1
    ).first()
    if next_m:
        next_mp = MissionProgress.query.filter_by(user_id=user_id, mission_id=next_m.id).first()
        if not next_mp:
            next_mp = MissionProgress(user_id=user_id, lab_id=lab_id, mission_id=next_m.id, status='AVAILABLE')
            db.session.add(next_mp)
        elif next_mp.status == 'LOCKED':
            next_mp.status = 'AVAILABLE'
            db.session.add(next_mp)


def _collect_evidence_for_mission(user_id, lab_id, mission_id):
    """Auto-collects cryptographic evidence for lab6 and lab7 chapters."""
    evidence_map = {
        'lab6_m1': 'e_l6_01',
        'lab6_m2': 'e_l6_02',
        'lab6_m3': 'e_l6_03',
        'lab6_m4': 'e_l6_04',
        'lab6_m5': 'e_l6_05',
        'lab7_m1': 'e_l7_01',
        'lab7_m2': 'e_l7_02',
        'lab7_m3': 'e_l7_03',
        'lab7_m4': 'e_l7_04',
        'lab7_m5': 'e_l7_05',
    }
    ev_id = evidence_map.get(mission_id)
    if ev_id:
        ep = EvidenceProgress.query.filter_by(user_id=user_id, evidence_id=ev_id).first()
        if not ep:
            ep = EvidenceProgress(user_id=user_id, evidence_id=ev_id, collected=True)
            db.session.add(ep)
        elif not ep.collected:
            ep.collected = True
            db.session.add(ep)

