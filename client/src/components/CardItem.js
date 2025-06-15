import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Stack,
  CardActionArea,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CARD_TYPES } from '../constants';



const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 36,
  width: '100%',
  aspectRatio: '1 / 1',
  transition: 'transform 0.3s ease-in-out',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
  },
  [theme.breakpoints.down('sm')]: {
    height: 12,
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(1),
  background: 'linear-gradient(180deg, rgba(30,30,30,0.8) 0%, rgba(30,30,30,1) 100%)',
  transition: 'background 0.3s ease-in-out',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.2),
    fontSize: '0.6rem',
  },
}));

const CardItem = ({ item, type }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (type === CARD_TYPES.CHAMPION) {
      navigate(`/${type}/${item.name.toLowerCase().replace(/\s+/g, '-')}`);
    } else {
      navigate(`/${type}/${item._id}`);
    }
  };

  const renderChampionCard = () => (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        maxWidth: '100%',
        maxHeight: '100%',
        boxShadow: 'none',
        background: 'rgba(30,30,30,0.95)',
        m: 0, p: 0,
        '@media (max-width:600px)': {
          width: '100%', height: '100%', minWidth: 0, minHeight: 0, maxWidth: '100%', maxHeight: '100%',
        }
      }}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{
          width: '100%', height: '100%', minWidth: 0, minHeight: 0, maxWidth: '100%', maxHeight: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 0, m: 0,
        }}
      >
        <CardMedia
          className="card-media"
          image={item.image}
          title={item.name}
          sx={{
            width: '60%', height: '60%', borderRadius: 8, objectFit: 'cover', margin: '0 auto 2px auto',
            '@media (min-width:601px)': { width: 36, height: 36 },
          }}
        />
        <CardContent
          className="card-content"
          sx={{
            p: 0, fontSize: '0.7rem', minHeight: 0, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width: '100%',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            noWrap
            sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.1, textAlign: 'center' }}
          >
            {item.name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  const renderEquipmentCard = () => (
    <Box
      sx={{
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 4,
        boxShadow: '0 4px 24px rgba(201,160,99,0.08)',
        backdropFilter: 'blur(8px)',
        border: '1.5px solid rgba(233,196,106,0.25)',
        p: 2,
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(201,160,99,0.18)',
        },
      }}
    >
      <CardActionArea onClick={handleClick}>
        <StyledCardMedia
          className="card-media"
          image={item.image}
          title={item.name}
        />
        <StyledCardContent className="card-content">
          <Typography variant="h6" component="div" gutterBottom>
            {item.name}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            {/* No chips needed here */}
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </Typography>
        </StyledCardContent>
      </CardActionArea>
    </Box>
  );

  const renderNewsCard = () => (
    <Box
      sx={{
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 4,
        boxShadow: '0 4px 24px rgba(201,160,99,0.08)',
        backdropFilter: 'blur(8px)',
        border: '1.5px solid rgba(233,196,106,0.25)',
        p: 2,
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(201,160,99,0.18)',
        },
      }}
    >
      <CardActionArea onClick={handleClick}>
        <StyledCardMedia
          className="card-media"
          image={item.image}
          title={item.title}
        />
        <StyledCardContent className="card-content">
          <Typography variant="h6" component="div" gutterBottom>
            {item.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.content}
          </Typography>
        </StyledCardContent>
      </CardActionArea>
    </Box>
  );

  switch (type) {
    case CARD_TYPES.CHAMPION:
      return renderChampionCard();
    case CARD_TYPES.EQUIPMENT:
      return renderEquipmentCard();
    case CARD_TYPES.NEWS:
      return renderNewsCard();
    default:
      return null;
  }
};

export default CardItem; 