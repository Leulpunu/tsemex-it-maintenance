import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  background-color: ${props => props.theme.cardBackground};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const Textarea = styled.textarea`
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  min-height: 100px;
  resize: vertical;
`;

const Select = styled.select`
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const Button = styled.button`
  padding: 0.5rem;
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;

  &:hover {
    opacity: 0.9;
  }
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.error};
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.p`
  color: ${props => props.theme.accent};
  margin-bottom: 1rem;
`;

function RequestForm({ user }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'hardware',
    department: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/requests', formData);
      setSuccess('Request submitted successfully!');
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'hardware',
        department: ''
      });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    }
  };

  return (
    <FormContainer>
      <h2>Submit IT Maintenance Request</h2>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="title"
          placeholder="Request Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <Textarea
          name="description"
          placeholder="Describe your IT issue in detail"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <Select name="priority" value={formData.priority} onChange={handleChange}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
          <option value="urgent">Urgent</option>
        </Select>
        <Select name="category" value={formData.category} onChange={handleChange}>
          <option value="hardware">Hardware</option>
          <option value="software">Software</option>
          <option value="network">Network</option>
          <option value="account">Account/Access</option>
          <option value="other">Other</option>
        </Select>
        <Input
          type="text"
          name="department"
          placeholder="Your Department"
          value={formData.department}
          onChange={handleChange}
          required
        />
        <Button type="submit">Submit Request</Button>
      </Form>
    </FormContainer>
  );
}

export default RequestForm;
