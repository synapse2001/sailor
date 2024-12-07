import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useFirebase } from '../../context/Firebase';
import { useTheme } from '@mui/material/styles';

const BrandMaskMappings = ({ open, onClose }) => {
  const [mappings, setMappings] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const firebase = useFirebase();
  const theme =useTheme();

  // Fetch data when dialog opens
  useEffect(() => {
    if (open) fetchMappings();
  }, [open]);

  const fetchMappings = async () => {
    try {
      const data = await firebase.fetchData('/brandmaskmappings');
      const formattedData = Object.entries(data || {}).map(([key, value]) => ({
        id: key,
        key,
        value: value.mask,
      }));
      console.log(formattedData)
      setMappings(formattedData.sort((a, b) => a.key.localeCompare(b.key)));
    } catch (error) {
      console.error('Error fetching brand mask mappings:', error);
    }
  };

  const handleAddMapping = async () => {
    if (!newKey || !newValue) return;
    try {
      const formattedValue = { mask: newValue }; // Store value in an object for consistency
      await firebase.putData(`/brandmaskmappings/${newKey}`, formattedValue);

      // Add the new mapping to state and sort
      const updatedMappings = [
        ...mappings,
        { id: newKey, key: newKey, value: formattedValue.mask },
      ];
      setMappings(updatedMappings.sort((a, b) => a.key.localeCompare(b.key)));

      // Clear input fields
      setNewKey('');
      setNewValue('');
    } catch (error) {
      console.error('Error adding new mapping:', error);
    }
  };

  const columns = [
    { field: 'key', headerName: 'Brand', flex: 1 },
    { field: 'value', headerName: 'Mask Mapping', flex: 1 },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Brand Mask Mappings</DialogTitle>
      <DialogContent>
        <Box sx={{ height: 400, marginBottom: 2 }}>
          <DataGrid
            rows={mappings}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
            sx={{
                '& .MuiDataGrid-menuIconButton': {
                  color: theme.palette.primary.main,
                },
                '& .MuiDataGrid-sortIcon': {
                  color: theme.palette.primary.main,
                },
                // Add border color customization
                border: `1px solid ${theme.palette.primary.main}`,
                '& .MuiDataGrid-cell': {
                  borderColor: theme.palette.primary.main,
                },
                '& .MuiDataGrid-columnHeaders': {
                  borderColor: theme.palette.primary.main,
                },
                '& .MuiDataGrid-columnSeparator': {
                  color: theme.palette.primary.main,
                },
                '& .MuiDataGrid-row': {
                  borderColor: theme.palette.primary.main,
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: `1px solid ${theme.palette.primary.main}`,
                }
              }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
          <TextField
            label="Brand"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            fullWidth
          />
          <TextField
            label="Mask Mapping"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={handleAddMapping} style={{ borderRadius: '8px', marginLeft: '5px', color: theme.palette.black.main }}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BrandMaskMappings;
