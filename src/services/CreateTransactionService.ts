import { getRepository, getCustomRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid type!', 401);
    }

    const categoryRepository = getRepository(Category);

    let existingCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!existingCategory) {
      existingCategory = categoryRepository.create({ title: category });
      existingCategory = await categoryRepository.save(existingCategory);
    }

    const transactionRepository = getCustomRepository(TransactionRepository);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('You do not have enouth balance!');
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: existingCategory.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
