import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Order } from './status.model';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { OrderStatus } from './status.constant';

@Injectable()
export class StatusService {
  private controlTowerUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.controlTowerUrl = this.configService.get('CONTROL_TOWER_URL');
  }

  getAllPossibleStatuses(): OrderStatus[] {
    return Object.values(OrderStatus);
  }

  async updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const response = await firstValueFrom(
      this.httpService
        .put<Order>(`${this.controlTowerUrl}/order/${orderId}`, { status })
        .pipe(
          catchError((error: AxiosError) => {
            if (error.response?.status === 404) {
              throw new NotFoundException(`Order ${orderId} not found`);
            }
            throw new InternalServerErrorException("Can't get order status");
          }),
        ),
    );

    return response.data;
  }

  async getStatusById(orderId: number): Promise<Order> {
    const response = await firstValueFrom(
      this.httpService
        .get<Order>(`${this.controlTowerUrl}/order/${orderId}`)
        .pipe(
          catchError((error: AxiosError) => {
            if (error.response?.status === 404) {
              throw new NotFoundException(`Order ${orderId} not found`);
            }
            throw new InternalServerErrorException("Can't get order status");
          }),
        ),
    );

    return response.data;
  }
}
