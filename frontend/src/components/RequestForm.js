import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;

  &:hover {
    background-color: ${props => props.theme.accent};
  }
`;

const BackButton = styled(Button)`
  background-color: ${props => props.theme.secondary};
  margin-right: 1rem;

  &:hover {
    background-color: ${props => props.theme.secondary};
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
  const { t } = useTranslation();
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
      setSuccess(t('requestForm.successMessage'));
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'hardware',
        department: ''
      });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || t('requestForm.errorMessage'));
    }
  };

  return (
    <FormContainer>
      <BackButton onClick={() => navigate('/dashboard')}>{t('common.backToDashboard')}</BackButton>
      <h2>{t('requestForm.title')}</h2>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="title"
          placeholder={t('requestForm.titlePlaceholder')}
          value={formData.title}
          onChange={handleChange}
          required
        />
        <Textarea
          name="description"
          placeholder={t('requestForm.descriptionPlaceholder')}
          value={formData.description}
          onChange={handleChange}
          required
        />
        <Select name="priority" value={formData.priority} onChange={handleChange}>
          <option value="low">{t('requestForm.lowPriority')}</option>
          <option value="medium">{t('requestForm.mediumPriority')}</option>
          <option value="high">{t('requestForm.highPriority')}</option>
          <option value="urgent">{t('requestForm.urgentPriority')}</option>
        </Select>
        <Select name="category" value={formData.category} onChange={handleChange}>
          <option value="hardware">{t('requestForm.hardware')}</option>
          <option value="software">{t('requestForm.software')}</option>
          <option value="network">{t('requestForm.network')}</option>
          <option value="account">{t('requestForm.account')}</option>
          <option value="other">{t('requestForm.other')}</option>
        </Select>
        <Input
          type="text"
          name="department"
          placeholder={t('requestForm.departmentPlaceholder')}
          value={formData.department}
          onChange={handleChange}
          required
        />
        <Button type="submit">{t('requestForm.submitButton')}</Button>
      </Form>
    </FormContainer>
  );
}

export default RequestForm;
