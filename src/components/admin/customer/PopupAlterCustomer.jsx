import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper
} from '@mui/material';

const PopupAlterCustomer = ({ open, handleClose, customerData, handleSave }) => {
    const [editedCustomer, setEditedCustomer] = useState({
      ...customerData,
      outstandingBalance: customerData?.outstandingBalance || 0,
      customerStatus: customerData?.customerStatus || 'Active',
      customerCreditWorthy: customerData?.customerCreditWorthy || false,
      loyaltyProgramMember: customerData?.loyaltyProgramMember || false,
      preferredPaymentMethod: customerData?.preferredPaymentMethod || 'BANK TRANSFER',
      preferredContactMethod: customerData?.preferredContactMethod || 'Phone',
      customerPaymentTerms: customerData?.customerPaymentTerms || 'NA',
      customerAreaCode: customerData?.customerAreaCode || 'KTM',
      customerCode: customerData?.customerCode || 'CUST00',
      customerType: customerData?.customerType || 'Retail',
      taxId: customerData?.taxId || 'NA',
      notes: customerData?.notes || '',
    });
    const [errors, setErrors] = useState({});
  
    useEffect(() => {
      setEditedCustomer({
        ...customerData,
        outstandingBalance: customerData?.outstandingBalance || 0,
        customerStatus: customerData?.customerStatus || 'Active',
        customerCreditWorthy: customerData?.customerCreditWorthy || false,
        loyaltyProgramMember: customerData?.loyaltyProgramMember || false,
        preferredPaymentMethod: customerData?.preferredPaymentMethod || 'BANK TRANSFER',
        preferredContactMethod: customerData?.preferredContactMethod || 'Phone',
        customerPaymentTerms: customerData?.customerPaymentTerms || 'NA',
        customerAreaCode: customerData?.customerAreaCode || 'KTM',
        customerCode: customerData?.customerCode || 'CUST00',
        customerType: customerData?.customerType || 'Retail',
        taxId: customerData?.taxId || 'NA',
        notes: customerData?.notes || '',
      });
      setErrors({});
    }, [customerData]);
  
    const validateField = (field, value) => {
      switch (field) {
        case 'customerName':
          return value.trim() === '' ? 'Customer Name is required' : '';
        case 'customerEmail':
          return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ? 'Invalid email format'
            : '';
        case 'customerPhone':
          return !/^\d{10}$/.test(value)
            ? 'Phone must be a 10-digit number'
            : '';
        case 'customerAddress':
          return value.trim() === '' ? 'Address is required' : '';
        case 'outstandingBalance':
          return !/^\d+(\.\d{1,2})?$/.test(value)
            ? 'Invalid balance amount'
            : '';
        default:
          return '';
      }
    };
  
    const handleFieldChange = (field, value) => {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
      setEditedCustomer((prevState) => ({
        ...prevState,
        [field]: value,
      }));
    };
  
    const validateForm = () => {
      const newErrors = {
        customerName: validateField('customerName', editedCustomer.customerName || ''),
        customerEmail: validateField('customerEmail', editedCustomer.customerEmail || ''),
        customerPhone: validateField('customerPhone', editedCustomer.customerPhone || ''),
        customerAddress: validateField('customerAddress', editedCustomer.customerAddress || ''),
        outstandingBalance: validateField('outstandingBalance', editedCustomer.outstandingBalance),
      };
  
      setErrors(newErrors);
      return !Object.values(newErrors).some((error) => error !== '');
    };
  
    const handleAction = () => {
      if (validateForm()) {
        const timestamp = new Date().toISOString();
        const updatedCustomer = {
          ...editedCustomer,
          accountCreationDate: customerData ? editedCustomer.accountCreationDate : timestamp,
          accountUpdateDate: timestamp,
        };
        handleSave(updatedCustomer);
        handleClose();
      }
    };
  
    const setBackgroundColor = {
      PaperProps: {
        style: {
          backgroundColor: '#333',
        },
      },
    };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{customerData ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Customer Name"
          value={editedCustomer.customerName || ''}
          onChange={(e) => handleFieldChange('customerName', e.target.value)}
          fullWidth
          error={!!errors.customerName}
          helperText={errors.customerName}
          variant="outlined"
          style={{ marginBottom: '1rem' }}
        />
        <TextField
          label="Email"
          value={editedCustomer.customerEmail || ''}
          onChange={(e) => handleFieldChange('customerEmail', e.target.value)}
          fullWidth
          variant="outlined"
          error={!!errors.customerEmail}
          helperText={errors.customerEmail}
          style={{ marginBottom: '1rem' }}
        />
        <TextField
          label="Phone"
          value={editedCustomer.customerPhone || ''}
          onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
          fullWidth
          variant="outlined"
          error={!!errors.customerPhone}
          helperText={errors.customerPhone}
          style={{ marginBottom: '1rem' }}
        />
        <TextField
          label="Address"
          value={editedCustomer.customerAddress || ''}
          onChange={(e) => handleFieldChange('customerAddress', e.target.value)}
          fullWidth
          variant="outlined"
          error={!!errors.customerAddress}
          helperText={errors.customerAddress}
          style={{ marginBottom: '1rem' }}
        />
        <FormControl fullWidth style={{ marginBottom: '1rem' }} variant="outlined">
          <InputLabel>Status</InputLabel>
          <Select
            value={editedCustomer.customerStatus || ''}
            onChange={(e) => handleFieldChange('customerStatus', e.target.value)}
            label="Status"
            MenuProps={setBackgroundColor}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth style={{ marginBottom: '1rem' }} variant="outlined">
          <InputLabel>Credit Worthy</InputLabel>
          <Select
            value={editedCustomer.customerCreditWorthy ? 'Yes' : 'No'}
            onChange={(e) =>
              handleFieldChange('customerCreditWorthy', e.target.value === 'Yes')
            }
            label="Credit Worthy"
            MenuProps={setBackgroundColor}
          >
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth style={{ marginBottom: '1rem' }} variant="outlined">
          <InputLabel>Loyalty Member</InputLabel>
          <Select
            value={editedCustomer.loyaltyProgramMember ? 'Yes' : 'No'}
            onChange={(e) =>
              handleFieldChange('loyaltyProgramMember', e.target.value === 'Yes')
            }
            label="Loyalty Member"
            MenuProps={setBackgroundColor}
          >
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth style={{ marginBottom: '1rem' }} variant="outlined">
          <InputLabel>Customer Code</InputLabel>
          <Select
            value={editedCustomer.customerCode || ''}
            onChange={(e) => handleFieldChange('customerCode', e.target.value)}
            label="Customer Code"
            MenuProps={setBackgroundColor}
          >
            <MenuItem value="CUST00">CUST00</MenuItem>
            <MenuItem value="NA">NA</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth style={{ marginBottom: '1rem' }} variant="outlined">
          <InputLabel>Area Code</InputLabel>
          <Select
            value={editedCustomer.customerAreaCode || ''}
            onChange={(e) => handleFieldChange('customerAreaCode', e.target.value)}
            label="Area Code"
            MenuProps={setBackgroundColor}
          >
            <MenuItem value="KTM">KTM</MenuItem>
            <MenuItem value="NA">NA</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth style={{ marginBottom: '1rem' }} variant="outlined">
          <InputLabel>Customer Type</InputLabel>
          <Select
            value={editedCustomer.customerType || ''}
            onChange={(e) => handleFieldChange('customerType', e.target.value)}
            label="Customer Type"
            MenuProps={setBackgroundColor}
          >
            <MenuItem value="Retail">Retail</MenuItem>
            <MenuItem value="Wholesale">Wholesale</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth style={{ marginBottom: '1rem' }} variant="outlined">
          <InputLabel>Preferred Payment Method</InputLabel>
          <Select
            value={editedCustomer.preferredPaymentMethod || ''}
            onChange={(e) => handleFieldChange('preferredPaymentMethod', e.target.value)}
            label="Preferred Payment Method"
            MenuProps={setBackgroundColor}
          >
            <MenuItem value="CASH">CASH</MenuItem>
            <MenuItem value="BANK TRANSFER">BANK TRANSFER</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth style={{ marginBottom: '1rem' }} variant="outlined">
          <InputLabel>Preferred Contact Method</InputLabel>
          <Select
            value={editedCustomer.preferredContactMethod || ''}
            onChange={(e) => handleFieldChange('preferredContactMethod', e.target.value)}
            label="Preferred Contact Method"
            MenuProps={setBackgroundColor}
          >
            <MenuItem value="Phone">Phone</MenuItem>
            <MenuItem value="Email">Email</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth style={{ marginBottom: '1rem' }} variant="outlined">
          <InputLabel>Payment Terms</InputLabel>
          <Select
            value={editedCustomer.customerPaymentTerms || ''}
            onChange={(e) => handleFieldChange('customerPaymentTerms', e.target.value)}
            label="Payment Terms"
            MenuProps={setBackgroundColor}
          >
            <MenuItem value="CRD15">CRD15</MenuItem>
            <MenuItem value="NA">NA</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="TAX ID"
          value={editedCustomer.taxId || ''}
          onChange={(e) => handleFieldChange('taxId', e.target.value)}
          fullWidth
          variant="outlined"
          style={{ marginBottom: '1rem' }}
        />
        <TextField
          label="Outstanding Balance"
          type="number"
          value={editedCustomer.outstandingBalance}
          onChange={(e) => handleFieldChange('outstandingBalance', parseFloat(e.target.value))}
          fullWidth
          variant="outlined"
          error={!!errors.outstandingBalance}
          helperText={errors.outstandingBalance}
          style={{ marginBottom: '1rem' }}
        />
        <TextField
          label="Notes"
          value={editedCustomer.notes || ''}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          style={{ marginBottom: '1rem' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAction} color="primary">
          {customerData ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopupAlterCustomer;
