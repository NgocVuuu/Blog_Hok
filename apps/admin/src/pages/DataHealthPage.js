import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 20 }}>
      {value === index && children}
    </div>
  );
}

const DataHealthPage = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/data-checks/summary`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            } else {
                setError(json.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading && !data) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
    if (error) return <Box sx={{ p: 4, color: 'error.main' }}>Error: {error}</Box>;
    if (!data) return null;

    const issuesCount = {
        skins: data.duplicateSkins.length + data.similarSkins.length,
        equipment: data.duplicateEquipment.length + data.similarEquipment.length,
        images: data.missingSkinImages.length + data.missingHeroImages.length,
        security: data.security ? data.security.length : 0
    };

    const hasAnyIssue = Object.values(issuesCount).some(c => c > 0);

    const getSecurityColor = (severity) => {
        switch(severity) {
            case 'critical': return 'error';
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'info': return 'info';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShieldIcon color="primary" /> Kiểm tra dữ liệu & Bảo mật
                </Typography>
                <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="outlined">
                    Quét lại
                </Button>
            </Box>

            {!hasAnyIssue && (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'success.light', color: 'white', mb: 3 }}>
                    <Typography variant="h6"><CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Hệ thống khỏe mạnh!</Typography>
                    <Typography>Không tìm thấy vấn đề nào về dữ liệu hay bảo mật.</Typography>
                </Paper>
            )}

            <Paper sx={{ width: '100%' }}>
                <Tabs 
                    value={tabIndex} 
                    onChange={(_, v) => setTabIndex(v)}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Tướng & Skins {issuesCount.skins > 0 && <Chip size="small" label={issuesCount.skins} color="warning" />}</Box>} />
                    <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Trang bị {issuesCount.equipment > 0 && <Chip size="small" label={issuesCount.equipment} color="warning" />}</Box>} />
                    <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Hình ảnh {issuesCount.images > 0 && <Chip size="small" label={issuesCount.images} color="error" />}</Box>} />
                    <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Bảo mật {issuesCount.security > 0 && <Chip size="small" label={issuesCount.security} color="error" />}</Box>} />
                </Tabs>
            </Paper>

            {/* TAB 0: SKINS */}
            <TabPanel value={tabIndex} index={0}>
                {issuesCount.skins === 0 ? (
                    <Typography color="text.secondary" sx={{ p: 2, fontStyle: 'italic' }}>Không có lỗi về Skin.</Typography>
                ) : (
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom color="warning.main"><WarningIcon sx={{ verticalAlign: 'bottom', mr: 1 }}/> Skin trùng lặp & Tương tự</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Tướng</TableCell>
                                        <TableCell>Vấn đề</TableCell>
                                        <TableCell>Chi tiết</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.duplicateSkins.map((item, idx) => (
                                        <TableRow key={`dup-${idx}`} hover>
                                            <TableCell><strong>{item.heroName}</strong></TableCell>
                                            <TableCell><Chip label="Trùng lặp chính xác" color="error" size="small" variant="outlined" /></TableCell>
                                            <TableCell>Skin <b>"{item.skinName}"</b> tại vị trí {item.index} trùng với vị trí {item.originalIndex}</TableCell>
                                        </TableRow>
                                    ))}
                                    {data.similarSkins.map((item, idx) => (
                                        <TableRow key={`sim-${idx}`} hover>
                                            <TableCell><strong>{item.heroName}</strong></TableCell>
                                            <TableCell><Chip label="Tên gần giống" color="warning" size="small" variant="outlined" /></TableCell>
                                            <TableCell>
                                                <b>"{item.skin1}"</b> ≈ <b>"{item.skin2}"</b> 
                                                <Typography variant="caption" display="block" color="text.secondary">Khác biệt: {item.distance} ký tự</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
            </TabPanel>

            {/* TAB 1: EQUIPMENT */}
            <TabPanel value={tabIndex} index={1}>
                {issuesCount.equipment === 0 ? (
                    <Typography color="text.secondary" sx={{ p: 2, fontStyle: 'italic' }}>Không có lỗi về Trang bị.</Typography>
                ) : (
                    <Paper sx={{ p: 2 }}>
                         <Typography variant="h6" gutterBottom color="warning.main"><CompareArrowsIcon sx={{ verticalAlign: 'bottom', mr: 1 }}/> Trang bị trùng lặp</Typography>
                         <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Tên 1</TableCell>
                                        <TableCell>Tên 2</TableCell>
                                        <TableCell>Vấn đề</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.duplicateEquipment.map((item, idx) => (
                                        <TableRow key={`dup-eq-${idx}`} hover>
                                            <TableCell><strong>{item.name}</strong> <br/><small>{item.originalId}</small></TableCell>
                                            <TableCell><strong>{item.name}</strong> <br/><small>{item.duplicateId}</small></TableCell>
                                            <TableCell><Chip label="Trùng lặp chính xác" color="error" size="small" /></TableCell>
                                        </TableRow>
                                    ))}
                                    {data.similarEquipment.map((item, idx) => (
                                        <TableRow key={`sim-eq-${idx}`} hover>
                                            <TableCell><strong>{item.name1}</strong> <br/><small>{item.id1}</small></TableCell>
                                            <TableCell><strong>{item.name2}</strong> <br/><small>{item.id2}</small></TableCell>
                                            <TableCell><Chip label="Tên gần giống" color="warning" size="small" /> (Diff: {item.distance})</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
            </TabPanel>

            {/* TAB 2: IMAGES */}
            <TabPanel value={tabIndex} index={2}>
                 {issuesCount.images === 0 ? (
                    <Typography color="text.secondary" sx={{ p: 2, fontStyle: 'italic' }}>Tất cả hình ảnh đầy đủ.</Typography>
                ) : (
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom color="error.main"><ImageNotSupportedIcon sx={{ verticalAlign: 'bottom', mr: 1 }}/> Thiếu hình ảnh</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Mục tiêu</TableCell>
                                        <TableCell>Chi tiết</TableCell>
                                        <TableCell>Loại</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.missingHeroImages.map((item, idx) => (
                                        <TableRow key={`miss-hero-${idx}`} hover>
                                            <TableCell><strong>{item.heroName}</strong></TableCell>
                                            <TableCell>Thiếu Avatar chính</TableCell>
                                            <TableCell><Chip label="Hero" size="small" /></TableCell>
                                        </TableRow>
                                    ))}
                                    {data.missingSkinImages.map((item, idx) => (
                                        <TableRow key={`miss-skin-${idx}`} hover>
                                            <TableCell><strong>{item.heroName}</strong></TableCell>
                                            <TableCell>Skin: {item.skinName}</TableCell>
                                            <TableCell><Chip label="Skin" size="small" variant="outlined" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
            </TabPanel>

             {/* TAB 3: SECURITY */}
             <TabPanel value={tabIndex} index={3}>
                {(!data.security || data.security.length === 0) ? (
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CheckCircleIcon color="success" fontSize="large" />
                        <Typography>Không phát hiện vấn đề bảo mật cơ bản nào.</Typography>
                    </Box>
                ) : (
                    <Paper sx={{ p: 2 }}>
                         <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SecurityIcon color="primary"/> Báo cáo bảo mật
                         </Typography>
                         <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Mức độ</TableCell>
                                        <TableCell>Loại vấn đề</TableCell>
                                        <TableCell>Nội dung</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.security.map((item, idx) => (
                                        <TableRow key={`sec-${idx}`} hover>
                                            <TableCell>
                                                <Chip 
                                                    label={item.severity.toUpperCase()} 
                                                    color={getSecurityColor(item.severity)} 
                                                    size="small" 
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </TableCell>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell>{item.message}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         </TableContainer>
                    </Paper>
                )}
            </TabPanel>

        </Box>
    );
};

export default DataHealthPage;
