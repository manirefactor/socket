import { EntityBase } from "../submodules/Assessment-Platform-Entities/src/entities/EntityBase";
import { DtoBase } from "../submodules/Assessment-Platform-Dtos/src/dtos/DtoBase";
export class CustomResponse<Tdto = void> {
  constructor(status: number, message: string, result: Tdto) {
    this.status = status;
    this.message = message;
    this.result = result;
  }
  status: number;
  message: string;
  result: any;
}
