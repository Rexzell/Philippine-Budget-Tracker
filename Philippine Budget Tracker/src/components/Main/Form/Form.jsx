import React, { useState, useEffect, useContext } from 'react';
import { 
  TextField, Typography, Grid, Button, 
  FormControl, InputLabel, Select, MenuItem, FormHelperText 
} from '@material-ui/core';
import { ExpenseTrackerContext } from '../../../context/context';
import { v4 as uuidv4 } from 'uuid';
import { useSpeechContext } from '@speechly/react-client';

import formatDate from '../../../utils/formatDate';
import useStyles from './styles';
import { incomeCategories, expenseCategories } from '../../../constants/categories';
import CustomizedSnackbar from '../../Snackbar/Snackbar';

const initialState = {
  amount: '',
  category: '',
  type: 'Income',
  date: formatDate(new Date()),
}

const Form = () => {
  const classes = useStyles();
  const [formData, setFormData] = useState(initialState);
  const { addTransaction } = useContext(ExpenseTrackerContext);
  const { segment } = useSpeechContext();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isAmountEmpty = !formData.amount;
  const isAmountInvalid =
    !isAmountEmpty &&
    (Number.isNaN(Number(formData.amount)) || Number(formData.amount) <= 0);

  const isDateInvalid =
    !formData.date || isNaN(new Date(formData.date).getTime());

  const createTransaction = () => {
    setSubmitted(true);

    if (!formData.amount || !formData.category || !formData.date) {
      return;
    }

    if (
      isAmountEmpty ||
      isAmountInvalid ||
      !formData.category ||
      !formData.date
    ) {
      return;
    }

    const parsedDate = new Date(formData.date);

    if (
      Number.isNaN(Number(formData.amount)) ||
      isNaN(parsedDate.getTime())
    ) {
      return;
    }

    const transaction = { 
      ...formData, 
      amount: Number(formData.amount), 
      id: uuidv4() 
    };

    setOpen(true);
    addTransaction(transaction);
    setFormData(initialState);
    setSubmitted(false);
  };

  useEffect(() => {
    if(segment){
      if(segment.intent.intent === 'add_expense'){
        setFormData({ ...formData, type: 'Expense' });
      }

      else if(segment.intent.intent === 'add_income'){
        setFormData({ ...formData, type: 'Income' });
      }

      else if(segment.isFinal && segment.intent.intent === 'create_transaction'){
        return createTransaction();
      }

      else if(segment.isFinal && segment.intent.intent === 'cancel_transaction'){
        return setFormData(initialState);
      }

      segment.entities.forEach((e) => {
        const category = `${e.value.charAt(0)}${e.value.slice(1).toLowerCase()}`;

        switch(e.type){
          case 'amount':
            setFormData({ ...formData, amount: e.value });
            break;

          case 'category':
            if(incomeCategories.map((iC) => iC.type).includes(category)){
              setFormData({ ...formData, type: 'Income', category});
            }

            else if(expenseCategories.map((iC) => iC.type).includes(category)){
              setFormData({ ...formData, type: 'Expense', category});
            }
            break;

          case 'date':
            setFormData({ ...formData, date: e.value });
            break;

          default:
            break;
        }
      });

      if(segment.isFinal && formData.amount && formData.category && formData.type && formData.date){
        createTransaction();
      }
    }
  }, [segment]);

  const selectedCategories = formData.type === 'Income' ? incomeCategories : expenseCategories;

  return (
    <Grid container spacing={2}>
      <CustomizedSnackbar open={open} setOpen={setOpen} />

      <Grid item xs={12}>
        <Typography align="center" variant="subtitle2" gutterBottom>
          {segment && segment.words.map((w) => w.value).join(" ")}
        </Typography>
      </Grid>

      <Grid item xs={6}>
        <FormControl fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value,
                category: '',
              })
            }
          >
            <MenuItem value="Income">Income</MenuItem>
            <MenuItem value="Expense">Expense</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={6}>
        <FormControl fullWidth error={submitted && !formData.category}>
          <InputLabel>Category</InputLabel>
          <Select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {selectedCategories.map((c) => (
              <MenuItem key={c.type} value={c.type}>
                {c.type}
              </MenuItem>
            ))}
          </Select>

          {submitted && !formData.category && (
            <FormHelperText>Category is required</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={6}>
        <TextField
          type="number"
          label="Amount"
          fullWidth
          value={formData.amount}
          error={submitted && (isAmountEmpty || isAmountInvalid)}
          helperText={
            submitted
              ? isAmountEmpty
                ? "Amount is required"
                : isAmountInvalid
                ? "Invalid amount"
                : null
              : null
          }
          onChange={(e) => {
            let value = e.target.value;

            if (value === '') {
              setFormData({ ...formData, amount: value });
              return;
            }

            if (/^\d+(\.\d{0,2})?$/.test(value)) {
              setFormData({ ...formData, amount: value });
            }
          }}
          onKeyDown={(e) => {
            if (["e", "E", "-", "+"].includes(e.key)) {
              e.preventDefault();
            }
          }}
          inputProps={{
            min: 1,
          }}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          type="date"
          label="Date"
          fullWidth
          value={formData.date}
          onKeyDown={(e) => e.preventDefault()}
          error={submitted && isDateInvalid}
          helperText={
            submitted && isDateInvalid ? "Select a date" : ""
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              date: formatDate(e.target.value),
            })
          }
          InputProps={{
            style: {
              color: submitted && isDateInvalid ? 'red' : undefined,
            },
          }}
        />
      </Grid>

      <Button className={classes.button} variant="outlined" color="primary" fullWidth onClick={createTransaction} >Create</Button>
    </Grid>
  )
}

export default Form;
