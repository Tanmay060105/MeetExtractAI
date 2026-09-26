from app.services.evaluation import DeterministicMatcher, calculate_jaccard

def test_jaccard_similarity():
    set1 = {"update", "the", "marketing", "deck"}
    set2 = {"update", "marketing", "deck"}
    assert calculate_jaccard(set1, set2) == 3 / 4

def test_exact_match():
    matcher = DeterministicMatcher()
    preds = [{"task": "Deploy Phase 11"}]
    gts = [{"task": "Deploy Phase 11"}]
    matches, um_p, um_g = matcher.match(preds, gts)
    assert len(matches) == 1
    assert len(um_p) == 0
    assert len(um_g) == 0

def test_case_punctuation_differences():
    matcher = DeterministicMatcher()
    preds = [{"task": "deploy phase 11!"}]
    gts = [{"task": "Deploy Phase 11."}]
    matches, um_p, um_g = matcher.match(preds, gts)
    assert len(matches) == 1

def test_minor_wording():
    matcher = DeterministicMatcher()
    preds = [{"task": "finish the marketing deck today"}]
    gts = [{"task": "finish marketing deck today"}]
    matches, um_p, um_g = matcher.match(preds, gts)
    assert len(matches) == 1

def test_completely_different():
    matcher = DeterministicMatcher()
    preds = [{"task": "buy groceries"}]
    gts = [{"task": "deploy phase 11"}]
    matches, um_p, um_g = matcher.match(preds, gts)
    assert len(matches) == 0
    assert len(um_p) == 1
    assert len(um_g) == 1

def test_duplicates_greedy_collision():
    matcher = DeterministicMatcher()
    preds = [
        {"task": "deploy phase 11"}, 
        {"task": "deploy phase 11 to prod"}
    ]
    gts = [
        {"task": "deploy phase 11"}
    ]
    matches, um_p, um_g = matcher.match(preds, gts)
    assert len(matches) == 1
    assert len(um_p) == 1
    assert len(um_g) == 0
    # The exact match should be picked first
    assert matches[0][0]["task"] == "deploy phase 11"

def test_short_tasks():
    matcher = DeterministicMatcher()
    preds = [{"task": "do it"}]
    gts = [{"task": "do it now"}]
    matches, um_p, um_g = matcher.match(preds, gts)
    # intersection: 2 ("do", "it"). union: 3 ("do", "it", "now")
    # jaccard = 2/3 = 0.66 > 0.6 => match!
    assert len(matches) == 1

def test_empty_text():
    matcher = DeterministicMatcher()
    preds = [{"task": ""}]
    gts = [{"task": ""}]
    matches, um_p, um_g = matcher.match(preds, gts)
    assert len(matches) == 0
    assert len(um_p) == 1
    assert len(um_g) == 1

def test_unmatched_predictions():
    matcher = DeterministicMatcher()
    preds = [{"task": "pred1"}, {"task": "pred2"}]
    gts = [{"task": "pred1"}]
    matches, um_p, um_g = matcher.match(preds, gts)
    assert len(matches) == 1
    assert len(um_p) == 1
    assert len(um_g) == 0

def test_unmatched_ground_truth():
    matcher = DeterministicMatcher()
    preds = [{"task": "pred1"}]
    gts = [{"task": "pred1"}, {"task": "gt2"}]
    matches, um_p, um_g = matcher.match(preds, gts)
    assert len(matches) == 1
    assert len(um_p) == 0
    assert len(um_g) == 1
