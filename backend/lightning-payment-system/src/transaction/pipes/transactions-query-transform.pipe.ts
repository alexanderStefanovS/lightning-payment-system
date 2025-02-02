import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class TransactionsQueryTransformPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') {
      return value;
    }

    const { amount, description, state, page, limit, sortField, sortOrder, startDate, endDate, amountPriceInDollars } = value;

    const filters: any = {};
 
    if (amount) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        throw new BadRequestException('Amount must be a valid number');
      }
      filters.amount = parsedAmount;
    }

    if (amountPriceInDollars) {
      const parsedAmount = parseFloat(amountPriceInDollars);
      if (isNaN(parsedAmount)) {
        throw new BadRequestException('Amount must be a valid number');
      }
      filters.amountPriceInDollars = parsedAmount;
    }

    if (description) {
      filters.description = description;
    }

    if (state) {
      filters.state = state;
    }

    if (startDate || endDate) {
      const dateFilter: any = {};

      if (startDate) {
        const parsedStartDate = new Date(startDate);

        if (isNaN(parsedStartDate.getTime())) {
          throw new BadRequestException('Invalid startDate format');
        }

        dateFilter.$gte = parsedStartDate;
      }

      if (endDate) {
        const parsedEndDate = new Date(endDate);

        if (isNaN(parsedEndDate.getTime())) {
          throw new BadRequestException('Invalid endDate format');
        }

        dateFilter.$lte = parsedEndDate;
      }

      filters.date = dateFilter;
    }

    const sort: any = {};
    if (sortField) {
      if (!['state', 'amount', 'date', 'amountPriceInDollars'].includes(sortField)) {
        throw new BadRequestException('Invalid sort field');
      }
      sort.field = sortField;
      sort.order = sortOrder === 'desc' ? 'desc' : 'asc';
    }

    const pagination = {
      page: page && parseInt(page, 10) > 0 ? parseInt(page, 10) : 1,
      limit: limit && parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10,
    };

    return { filters, sort, pagination };
  }
}
