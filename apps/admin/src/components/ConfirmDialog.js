import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useTranslation } from '../i18nShim';

const ConfirmDialog = ({ open, title, content, onConfirm, onCancel, confirmLabel, cancelLabel, severity = 'error' }) => {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>{title || t('common.confirm', 'Xác nhận')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {content || t('common.confirmDelete', 'Bạn có chắc chắn muốn xóa mục này?')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="inherit">
                    {cancelLabel || t('common.cancel', 'Hủy')}
                </Button>
                <Button onClick={onConfirm} color={severity} variant="contained" autoFocus>
                    {confirmLabel || t('common.delete', 'Xóa')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
