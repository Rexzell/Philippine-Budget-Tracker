import { makeStyles } from '@material-ui/core/styles';

export default makeStyles(() => ({
  radioGroup: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '-10px',
  },

  button: {
    marginTop: '20px',
    borderColor: '#000',
    color: '#000',
    '&:hover':{
      background: '#F5F5F5',
      borderColor: '#000',
    },
  },
}));