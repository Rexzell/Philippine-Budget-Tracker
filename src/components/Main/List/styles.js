import { makeStyles } from '@material-ui/core/styles';
import { blue, red } from '@material-ui/core/colors';

export default makeStyles((theme) => ({
  avatarIncome: {
    color: '#fff',
    backgroundColor: '#03AC13',
  },

  avatarExpense: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
  },

  list: {
    maxHeight: '150px',
    overflow: 'auto',
  },
}));