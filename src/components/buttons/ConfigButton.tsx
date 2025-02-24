import { useNavigate } from 'react-router-dom';
import configImg from'../../../assets/config.svg'
import Button from './Button'

export default function ConfigButton() {
  const navigate = useNavigate();

  return (
      <Button 
        onClick={() => navigate('/settings')} 
        className="hidden lg:block"
        imgUrl={configImg}
      >
        Settings
      </Button>
      
     
  );
}