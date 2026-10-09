import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient
from main import app
from nlp import get_model, predict, heldout_evaluation
from preprocess import preprocess

client = TestClient(app)

def test_health_and_model():
    response = client.get('/api/health')
    assert response.status_code == 200
    get_model()
    assert len(heldout_evaluation()['rows']) == 18

def test_predict_three_probabilities_and_preprocessing():
    response = client.post('/api/analyze',json={'items':[{'text':'I love this excellent helpful app.'}]})
    assert response.status_code == 200
    row = response.json()['results'][0]
    assert row['label'] in {'positive','neutral','negative'}
    assert abs(sum(row['probabilities'].values())-1) < 1e-6
    assert row['preprocessing']['tokens']
    assert 'features' in row

def test_evaluate_and_metrics():
    rows=[{'text':'Excellent work','label':'positive'},{'text':'Terrible service','label':'negative'},{'text':'The table has three rows','label':'neutral'}]
    response=client.post('/api/evaluate',json={'items':rows})
    assert response.status_code == 200
    assert response.json()['metrics']['count']==3
    assert sum(map(sum,response.json()['metrics']['matrix']))==3

def test_input_validation():
    assert client.post('/api/analyze',json={'items':[]}).status_code==422
    assert client.post('/api/analyze',json={'items':[{'text':'  '}]}).status_code==422
    assert client.post('/api/evaluate',json={'items':[{'text':'Hello'}]}).status_code==422

def test_optional_image_validation():
    resp=client.post('/api/image/analyze',files={'file':('a.txt',b'hello','text/plain')})
    assert resp.status_code==415


def test_negation_kept_and_unrecognized_warned():
    data=preprocess('This is not nice.')
    assert 'not' in data['filtered']
    result=predict('xyzxyz qqqqq zzzzz')
    assert result['warnings']
    assert result['feature_count']==0
