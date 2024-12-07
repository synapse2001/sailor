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
    Paper,
    Autocomplete,
    IconButton,
    Box,
} from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import EditIcon from '@mui/icons-material/Edit';
import { useFirebase } from '../../../context/Firebase';
import { useAuth } from '../../../controllers/userState';

const PopupAlterOrder = ({ open, handleClose, orderData, handleSave }) => {
    const [customerData, setCustomerData] = useState([]);
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedOrder, setEditedOrder] = useState({
        orderNote: orderData?.additionalDetails?.orderNote || '',
        status: orderData?.status || 'pending',
        customerId: orderData?.additionalDetails?.customerId || '',
    });
    const [errors, setErrors] = useState({});
    const firebase = useFirebase();

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'warning';
            case 'completed': return 'success';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    useEffect(() => {
        if (open) {
            const fetchCustomers = async () => {
                try {
                    const data = await firebase.fetchData('customers');
                    const formattedData = Object.keys(data).map((key) => ({
                        id: key,
                        ...data[key],
                    }));
                    setCustomerData(formattedData);
                } catch (error) {
                    console.error('Error fetching customer data:', error);
                }
            };
            fetchCustomers();

            // Reset state when opening dialog
            setEditedOrder({
                orderNote: orderData?.additionalDetails?.orderNote || '',
                status: orderData?.status || 'pending',
                customerId: orderData?.additionalDetails?.customerId || '',
            });
            setErrors({});
            setIsEditing(false);
        }
    }, [firebase, open, orderData]);

    const validateField = (field, value) => {
        if (field === 'customerId' && !value.trim()) return 'Customer ID is required';
        if (field === 'orderNote' && !value.trim()) return 'Order Note is required';
        return '';
    };

    const handleFieldChange = (field, value) => {
        setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
        setEditedOrder((prev) => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        const newErrors = {
            customerId: validateField('customerId', editedOrder.customerId),
            orderNote: validateField('orderNote', editedOrder.orderNote),
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(Boolean);
    };

    const handleSaveAction = () => {
        if (validateForm()) {
            const timestamp = new Date().toISOString();
            const unixtimestamp = Math.floor(new Date().getTime() / 1000);

            const updatedOrder = {
                ...orderData,
                status: editedOrder.status,
                additionalDetails: {
                    ...orderData.additionalDetails,
                    customerId: editedOrder.customerId,
                    orderNote: editedOrder.orderNote,
                    updated_by: user.uid,
                },
                updatedOn: timestamp,
                timeline: {
                    ...orderData.timeline,
                    [unixtimestamp]: editedOrder.status,
                },
            };

            handleSave(updatedOrder);
            handleClose();
        }
    };

    const renderTimeline = () => {
        const timelineData = Object.entries(orderData?.timeline || {}).map(([timestamp, status]) => ({
            timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
            status,
        }));

        return (
            <Timeline>
                {timelineData.map((entry, index) => (
                    <TimelineItem key={index}>
                        <TimelineSeparator>
                            <TimelineDot color={getStatusColor(entry.status)} />
                            {index < timelineData.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                            <Box fontWeight="bold">{entry.status}</Box>
                            <Box>{entry.timestamp}</Box>
                        </TimelineContent>
                    </TimelineItem>
                ))}
            </Timeline>
        );
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth >
            <DialogTitle>
                Order Details
                <IconButton
                    onClick={() => setIsEditing((prev) => !prev)}
                    color="primary"
                    size="small"
                    style={{ float: 'right' }}
                >
                    <EditIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box display="flex" gap={2} flexDirection={{ xs: 'column', md: 'row' }}>
                    <Box flex={1}>
                        <Autocomplete
                            options={customerData}
                            getOptionLabel={(option) => option.customerName || ''}
                            value={customerData.find((c) => c.id === editedOrder.customerId) || null}
                            onChange={(e, newValue) =>
                                handleFieldChange('customerId', newValue ? newValue.id : '')
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Customer Name"
                                    variant="outlined"
                                    margin="dense"
                                    disabled={!isEditing}
                                    error={!!errors.customerId}
                                    helperText={errors.customerId}
                                />
                            )}
                            PaperComponent={(props) => (
                                <Paper {...props} style={{ backgroundColor: '#333', color: '#fff' }} />
                            )}
                        />

                        <FormControl fullWidth margin="dense">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={editedOrder.status}
                                onChange={(e) => handleFieldChange('status', e.target.value)}
                                label="Status"
                                disabled={!isEditing}
                                MenuProps={{ PaperProps: { style: { backgroundColor: '#333', color: '#fff' } } }}
                            >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="cancelled">Cancelled</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Order Note"
                            value={editedOrder.orderNote}
                            onChange={(e) => handleFieldChange('orderNote', e.target.value)}
                            fullWidth
                            variant="outlined"
                            margin="dense"
                            disabled={!isEditing}
                            error={!!errors.orderNote}
                            helperText={errors.orderNote}
                            multiline
                            rows={3}
                        />
                    </Box>

                    <Box flex={1}>
                        <Box fontWeight="bold" mb={1}>
                            Order Timeline
                        </Box>
                        {renderTimeline()}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                {isEditing && (
                    <Button onClick={handleSaveAction} color="primary">
                        Save
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default PopupAlterOrder;
