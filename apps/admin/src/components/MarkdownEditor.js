import React, { useState, useRef } from 'react';
import {
    Box, Button, TextField, Typography, Paper, Tabs, Tab, IconButton,
    Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, Tooltip, Divider
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import MovieIcon from '@mui/icons-material/Movie';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import CodeIcon from '@mui/icons-material/Code';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import { useTranslation } from '../i18nShim';

// Plugin to transform directives to HTML attributes (Same as client)
function remarkDirectiveRehype() {
    return (tree) => {
        visit(tree, (node) => {
            if (
                node.type === 'containerDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'textDirective'
            ) {
                const data = node.data || (node.data = {});
                const tagName = node.type === 'textDirective' ? 'span' : 'div';

                data.hName = tagName;
                data.hProperties = {
                    ...(node.attributes || {}),
                    className: node.name,
                };
            }
        });
    };
}

const MarkdownEditor = ({ value, onChange, onImageUpload, onVideoUpload }) => {
    const { t } = useTranslation();
    const [tab, setTab] = useState(0); // 0: Write, 1: Preview
    const textareaRef = useRef(null);
    const [anchorElLayout, setAnchorElLayout] = useState(null);

    // Media Dialog State
    const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
    const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaSize, setMediaSize] = useState('medium');
    const [mediaAlign, setMediaAlign] = useState('center');
    const [uploading, setUploading] = useState(false);

    const insertText = (text, cursorOffset = 0) => {
        const el = textareaRef.current;
        if (!el) {
            onChange(value + text);
            return;
        }
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newText = value.substring(0, start) + text + value.substring(end);
        onChange(newText);

        // Defer focus and selection set to allow React render cycle
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(start + cursorOffset, start + cursorOffset);
        }, 0);
    };

    const handleFormat = (type) => {
        switch (type) {
            case 'bold': insertText('**Bold**', 2); break;
            case 'italic': insertText('*Italic*', 1); break;
            case 'h2': insertText('\n## Heading 2\n', 4); break;
            case 'h3': insertText('\n### Heading 3\n', 5); break;
            case 'quote': insertText('\n> Quote\n', 3); break;
            case 'list': insertText('\n- Item 1\n- Item 2\n', 3); break;
            case 'link': insertText('[Link Text](url)', 1); break;
            case 'code': insertText('\n```\ncode block\n```\n', 5); break;
            case 'table':
                insertText('\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n', 12);
                break;
            default: break;
        }
    };

    const handleLayoutInsert = (type) => {
        setAnchorElLayout(null);
        let layoutCode = '';
        switch (type) {
            case '2col':
                layoutCode = '\n:::row\n:::col\n**Left Column**\nContent here...\n:::\n:::col\n**Right Column**\nContent here...\n:::\n:::\n';
                break;
            case '3col':
                layoutCode = '\n:::row\n:::col\n**Column 1**\n:::\n:::col\n**Column 2**\n:::\n:::col\n**Column 3**\n:::\n:::\n';
                break;
            case 'img-left':
                layoutCode = '\n:::row\n:::col\n![img|medium|rectangle|center](url)\n:::\n:::col\n**Description**\nText here...\n:::\n:::\n';
                break;
            default: break;
        }
        insertText(layoutCode);
    };

    const handleMediaSubmit = async () => {
        try {
            setUploading(true);
            let url = mediaUrl;

            if (mediaFile) {
                if (mediaType === 'image' && onImageUpload) {
                    url = await onImageUpload(mediaFile);
                } else if (mediaType === 'video' && onVideoUpload) {
                    url = await onVideoUpload(mediaFile);
                }
            }

            if (url) {
                const prefix = mediaType === 'image' ? 'img' : 'video';
                // Format: ![img|size|shape|align](url) - shape is ignored for video or if not needed
                const shape = 'rectangle'; // Default
                const meta = mediaType === 'image'
                    ? `${prefix}|${mediaSize}|${shape}|${mediaAlign}`
                    : `${prefix}|${mediaSize}|${mediaAlign}`;

                insertText(`![${meta}](${url})`);
                setMediaDialogOpen(false);
                setMediaUrl('');
                setMediaFile(null);
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Paper variant="outlined" sx={{ mt: 2, mb: 2, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f5f5f5' }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ minHeight: 40 }}>
                    <Tab label={t('admin.write', 'Write')} sx={{ minHeight: 40, py: 1 }} />
                    <Tab label={t('admin.preview', 'Preview')} sx={{ minHeight: 40, py: 1 }} />
                </Tabs>
            </Box>

            {tab === 0 && (
                <>
                    {/* Toolbar */}
                    <Box p={1} display="flex" gap={0.5} flexWrap="wrap" borderBottom={1} borderColor="divider" bgcolor="white">
                        <Tooltip title="Bold"><IconButton size="small" onClick={() => handleFormat('bold')}><FormatBoldIcon /></IconButton></Tooltip>
                        <Tooltip title="Italic"><IconButton size="small" onClick={() => handleFormat('italic')}><FormatItalicIcon /></IconButton></Tooltip>
                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                        <Button size="small" sx={{ minWidth: 30, px: 1 }} onClick={() => handleFormat('h2')}>H2</Button>
                        <Button size="small" sx={{ minWidth: 30, px: 1 }} onClick={() => handleFormat('h3')}>H3</Button>
                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                        <Tooltip title="Quote"><IconButton size="small" onClick={() => handleFormat('quote')}><FormatQuoteIcon /></IconButton></Tooltip>
                        <Tooltip title="List"><IconButton size="small" onClick={() => handleFormat('list')}><FormatListBulletedIcon /></IconButton></Tooltip>
                        <Tooltip title="Code"><IconButton size="small" onClick={() => handleFormat('code')}><CodeIcon /></IconButton></Tooltip>
                        <Tooltip title="Link"><IconButton size="small" onClick={() => handleFormat('link')}><LinkIcon /></IconButton></Tooltip>
                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                        <Tooltip title="Table"><IconButton size="small" onClick={() => handleFormat('table')}><TableChartIcon /></IconButton></Tooltip>
                        <Tooltip title="Layouts">
                            <IconButton size="small" onClick={(e) => setAnchorElLayout(e.currentTarget)}>
                                <ViewColumnIcon />
                            </IconButton>
                        </Tooltip>
                        <Menu anchorEl={anchorElLayout} open={Boolean(anchorElLayout)} onClose={() => setAnchorElLayout(null)}>
                            <MenuItem onClick={() => handleLayoutInsert('2col')}>2 Columns</MenuItem>
                            <MenuItem onClick={() => handleLayoutInsert('3col')}>3 Columns</MenuItem>
                            <MenuItem onClick={() => handleLayoutInsert('img-left')}>Image Left / Text Right</MenuItem>
                        </Menu>
                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                        <Tooltip title="Insert Image"><IconButton size="small" onClick={() => { setMediaType('image'); setMediaDialogOpen(true); }}><ImageIcon /></IconButton></Tooltip>
                        <Tooltip title="Insert Video"><IconButton size="small" onClick={() => { setMediaType('video'); setMediaDialogOpen(true); }}><MovieIcon /></IconButton></Tooltip>
                    </Box>

                    <TextField
                        inputRef={textareaRef}
                        multiline
                        fullWidth
                        minRows={20}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Write your post content here using Markdown..."
                        sx={{
                            '& .MuiInputBase-root': {
                                fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                                fontSize: '14px',
                                lineHeight: 1.6,
                                borderRadius: 0,
                                '& fieldset': { border: 'none' }
                            }
                        }}
                    />
                </>
            )}

            {tab === 1 && (
                <Box p={3} sx={{ minHeight: 400, bgcolor: 'white' }}>
                    <Box className="markdown-preview" sx={{
                        '& h2': { mt: 3, mb: 2, fontWeight: 700, fontSize: '1.5rem', borderLeft: '4px solid #C9A063', pl: 2 },
                        '& h3': { mt: 2, mb: 1, fontWeight: 600, fontSize: '1.25rem' },
                        '& blockquote': { borderLeft: '4px solid #ccc', m: 0, pl: 2, py: 1, color: '#666', bgcolor: '#f9f9f9' },
                        '& table': { width: '100%', borderCollapse: 'collapse', mb: 2, tableLayout: 'fixed' },
                        '& th': { bgcolor: '#f5f5f5', fontWeight: 600, border: '1px solid #ddd', p: 1, textAlign: 'center' },
                        '& td': { border: '1px solid #ddd', p: 1, textAlign: 'center', verticalAlign: 'middle' },
                        '& table p': { m: 0 },
                        // Removed strict overrides for table images to allow custom sizing. Added border radius.
                        '& table img': { borderRadius: '4px' }
                    }}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkDirective, remarkDirectiveRehype]}
                            components={{
                                table: ({ children }) => <table>{children}</table>,
                                thead: ({ children }) => <thead>{children}</thead>,
                                tbody: ({ children }) => <tbody>{children}</tbody>,
                                tr: ({ children }) => <tr>{children}</tr>,
                                th: ({ children }) => <th>{children}</th>,
                                td: ({ children }) => <td>{children}</td>,
                                img: ({ src, alt }) => {
                                    // Video support
                                    if (alt && typeof alt === 'string' && (alt === 'video' || alt.startsWith('video|') || alt.startsWith('video;') || alt.startsWith('video:'))) {
                                        let size = 'medium';
                                        const separator = alt.includes('|') ? '|' : alt.includes(';') ? ';' : ':';
                                        if (alt.includes(separator)) {
                                            const parts = alt.split(separator);
                                            size = parts[1] || 'medium';
                                        }

                                        // Simplify preview video
                                        return <Box p={2} bgcolor="#eee" textAlign="center" borderRadius={1}>[Video: {src}] ({size})</Box>;
                                    }

                                    // Image with size/shape support
                                    let maxWidth = '800px';
                                    let borderRadius = '8px';
                                    let align = 'center';
                                    let shape = 'rectangle';

                                    if (alt && typeof alt === 'string' && (alt.startsWith('img|') || alt.startsWith('img;') || alt.startsWith('img:'))) {
                                        const separator = alt.includes('|') ? '|' : alt.includes(';') ? ';' : ':';
                                        const parts = alt.split(separator);
                                        const sizeStr = parts[1] || 'medium';
                                        shape = parts[2] || 'rectangle';
                                        align = parts[3] || 'center';

                                        if (sizeStr === 'icon') maxWidth = '60px';
                                        else if (sizeStr === 'tiny') maxWidth = '120px';
                                        else if (sizeStr === 'small') maxWidth = '300px';
                                        else if (sizeStr === 'medium') maxWidth = '600px';
                                        else if (sizeStr === 'large') maxWidth = '100%';
                                    }

                                    const alignmentStyle = align === 'center'
                                        ? { marginLeft: 'auto', marginRight: 'auto', display: 'block' }
                                        : align === 'right'
                                            ? { marginLeft: 'auto', marginRight: 0, display: 'block' }
                                            : { display: 'block' };

                                    const wrapperShapeStyle = shape === 'square'
                                        ? { aspectRatio: '1 / 1', overflow: 'hidden' }
                                        : {};

                                    const imgShapeStyle = shape === 'square'
                                        ? { objectFit: 'cover' }
                                        : {};

                                    return (
                                        <Box component="span" className="media-wrapper" sx={{
                                            ...alignmentStyle,
                                            maxWidth,
                                            width: '100%',
                                            mb: 2,
                                            display: 'block',
                                            ...wrapperShapeStyle
                                        }}>
                                            <img
                                                src={src}
                                                alt={alt}
                                                style={{
                                                    width: '100%',
                                                    height: shape === 'square' ? '100%' : 'auto',
                                                    borderRadius: borderRadius,
                                                    ...imgShapeStyle
                                                }}
                                            />
                                        </Box>
                                    );
                                }
                            }}
                        >
                            {value}
                        </ReactMarkdown>
                    </Box>
                </Box>
            )}

            {/* Media Dialog */}
            <Dialog open={mediaDialogOpen} onClose={() => setMediaDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{mediaType === 'image' ? 'Insert Image' : 'Insert Video'}</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <Box display="flex" gap={2}>
                            <Button variant="outlined" component="label" fullWidth>
                                Upload File
                                <input type="file" hidden accept={mediaType === 'image' ? "image/*" : "video/*"} onChange={(e) => setMediaFile(e.target.files[0])} />
                            </Button>
                            <TextField
                                label="Or Paste URL"
                                fullWidth
                                size="small"
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                            />
                        </Box>
                        {mediaFile && <Typography variant="caption">{mediaFile.name}</Typography>}

                        <Box display="flex" gap={2}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Size</InputLabel>
                                <Select value={mediaSize} label="Size" onChange={(e) => setMediaSize(e.target.value)}>
                                    <MenuItem value="small">Small</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="large">Large</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Align</InputLabel>
                                <Select value={mediaAlign} label="Align" onChange={(e) => setMediaAlign(e.target.value)}>
                                    <MenuItem value="left">Left</MenuItem>
                                    <MenuItem value="center">Center</MenuItem>
                                    <MenuItem value="right">Right</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMediaDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleMediaSubmit} variant="contained" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Insert'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default MarkdownEditor;
