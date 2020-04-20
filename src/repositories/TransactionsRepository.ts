import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = transactions.reduce((acc, currentValue) => {
      if (currentValue.type === 'income') {
        return acc + Number(currentValue.value);
      }
      return acc + 0;
    }, 0);

    const outcome = transactions.reduce((acc, currentValue) => {
      if (currentValue.type === 'outcome') {
        return acc + Number(currentValue.value);
      }
      return acc + 0;
    }, 0);

    const balance: Balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
