import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

function Dashboard() {
  const [tip, setTip] = useState(null);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('authToken');
    
    try {
      // Fetch daily tip
      const tipResponse = await fetch('/api/tips/daily');
      const tipData = await tipResponse.json();
      if (tipResponse.ok) {
        setTip(tipData);
      }

      // Fetch workout count
      const workoutsResponse = await fetch('/api/workouts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const workoutsData = await workoutsResponse.json();
      if (workoutsResponse.ok) {
        setWorkoutCount(workoutsData.length);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
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

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col xs={12}>
          <h1 className="fw-bold">Welcome, {user.email?.split('@')[0]}!</h1>
          <p className="text-muted mt-2">Track your workouts and improve your running speed</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col xs={12} md={6} className="mb-4 mb-md-0">
          <Card className="h-100 shadow border-0" bg="primary" text="white">
            <Card.Body className="p-4">
              <Card.Title className="display-6 fw-bold mb-3">💡 Daily Tip</Card.Title>
              <blockquote className="mb-4">
                <p className="fs-5 mb-0">{tip?.tip || 'Loading tip...'}</p>
              </blockquote>
              <p className="text-white-50 small mb-0">
                Tip #{tip?.dayOfWeek !== undefined ? tip.dayOfWeek + 1 : '-'} of the week
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Row className="h-100 g-0">
            <Col xs={12} sm={6} className="mb-3 mb-sm-0">
              <Card className="h-100 shadow border-0" bg="success" text="white">
                <Card.Body className="p-4 d-flex flex-column justify-content-center">
                  <h className="display-4 fw-bold mb-2">{workoutCount}</h>
                  <p className="mb-0">Total Workouts</p>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card className="h-100 shadow border-0 d-flex align-items-center justify-content-center">
                <Card.Body className="p-4 text-center">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100 fw-medium"
                    onClick={() => navigate('/workouts')}
                  >
                    Log Workout
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col xs={12}>
          <Card className="shadow border-0">
            <Card.Body className="p-4">
              <h3 className="fw-bold mb-3">Quick Actions</h3>
              <div className="d-grid gap-2 d-sm-flex">
                <Button
                  variant="outline-primary"
                  size="lg"
                  className="fw-medium flex-grow-1"
                  onClick={() => navigate('/workouts')}
                >
                  View All Workouts
                </Button>
                <Button
                  variant="outline-success"
                  size="lg"
                  className="fw-medium flex-grow-1"
                  onClick={() => navigate('/workouts')}
                >
                  Add New Workout
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;