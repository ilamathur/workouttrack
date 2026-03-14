import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [formData, setFormData] = useState({
    type: 'run',
    duration: '',
    distance: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await fetch('/api/workouts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }
      
      const data = await response.json();
      setWorkouts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingWorkout(null);
    setFormData({
      type: 'run',
      duration: '',
      distance: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setError('');
    setShowModal(true);
  };

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    setFormData({
      type: workout.type,
      duration: workout.duration,
      distance: workout.distance || '',
      date: new Date(workout.date).toISOString().split('T')[0],
      notes: workout.notes || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    const token = localStorage.getItem('authToken');
    
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete workout');
      }

      setWorkouts(workouts.filter(w => w.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const token = localStorage.getItem('authToken');
    const url = editingWorkout 
      ? `/api/workouts/${editingWorkout.id}`
      : '/api/workouts';
    const method = editingWorkout ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save workout');
      }

      if (editingWorkout) {
        setWorkouts(workouts.map(w => 
          w.id === editingWorkout.id ? data : w
        ));
      } else {
        setWorkouts([data, ...workouts]);
      }

      setShowModal(false);
      setEditingWorkout(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container fluid className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4 align-items-center">
        <Col xs={12} md={8}>
          <h1 className="fw-bold mb-2">My Workouts</h1>
          <p className="text-muted mb-0">Track and manage your training sessions</p>
        </Col>
        <Col xs={12} md={4} className="text-md-end mt-3 mt-md-0">
          <Button variant="primary" size="lg" onClick={handleAdd} className="w-100 w-md-auto fw-medium">
            + Add Workout
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col xs={12}>
          <Card className="shadow border-0">
            <Card.Body className="p-0">
              {workouts.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <h3 className="mb-3">No workouts yet</h3>
                  <p className="mb-4">Start tracking your training by adding your first workout!</p>
                  <Button variant="primary" size="lg" onClick={handleAdd}>
                    Add Your First Workout
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Date</th>
                        <th>Type</th>
                        <th>Duration</th>
                        <th>Distance</th>
                        <th>Notes</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workouts.map((workout) => (
                        <tr key={workout.id}>
                          <td className="ps-4 fw-medium">{formatDate(workout.date)}</td>
                          <td>
                            <Badge bg={
                              workout.type.toLowerCase() === 'run' ? 'primary' :
                              workout.type.toLowerCase() === 'interval' ? 'danger' :
                              workout.type.toLowerCase() === 'tempo' ? 'warning' :
                              'secondary'
                            }>
                              {workout.type}
                            </Badge>
                          </td>
                          <td>{workout.duration} min</td>
                          <td>{workout.distance ? `${workout.distance} km` : '-'}</td>
                          <td className="text-muted text-truncate" style={{ maxWidth: '150px' }}>
                            {workout.notes || '-'}
                          </td>
                          <td className="text-end pe-4">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(workout)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(workout.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingWorkout ? 'Edit Workout' : 'Add New Workout'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col xs={12} md={6} className="mb-3">
                <Form.Label className="fw-medium">Workout Type</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  size="lg"
                >
                  <option value="run">Run</option>
                  <option value="interval">Interval</option>
                  <option value="tempo">Tempo</option>
                  <option value="easy">Easy Run</option>
                  <option value="long">Long Run</option>
                  <option value="recovery">Recovery</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Col>

              <Col xs={12} md={6} className="mb-3">
                <Form.Label className="fw-medium">Duration (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="30"
                  min="1"
                  required
                  size="lg"
                />
              </Col>

              <Col xs={12} md={6} className="mb-3">
                <Form.Label className="fw-medium">Distance (km, optional)</Form.Label>
                <Form.Control
                  type="number"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  placeholder="5.0"
                  step="0.1"
                  min="0"
                  size="lg"
                />
              </Col>

              <Col xs={12} md={6} className="mb-3">
                <Form.Label className="fw-medium">Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  size="lg"
                />
              </Col>

              <Col xs={12} className="mb-3">
                <Form.Label className="fw-medium">Notes (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="How did it feel? Any observations..."
                  rows="3"
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            size="lg"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={saving}
            className="fw-medium"
          >
            {saving ? 'Saving...' : (editingWorkout ? 'Update Workout' : 'Add Workout')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Workouts;