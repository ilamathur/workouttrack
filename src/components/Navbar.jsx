import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

function CustomNavbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container fluid>
        <Navbar.Brand as={Link} to={token ? "/dashboard" : "/login"} className="fw-bold">
          🏃 WorkoutTrack
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          {token ? (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/dashboard" className="fw-medium">
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/workouts" className="fw-medium">
                Workouts
              </Nav.Link>
              <Nav.Link onClick={handleLogout} className="fw-medium">
                Logout
              </Nav.Link>
            </Nav>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/login" className="fw-medium">
                Login
              </Nav.Link>
              <Nav.Link as={Link} to="/register" className="fw-medium">
                Register
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;