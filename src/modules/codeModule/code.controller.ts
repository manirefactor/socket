import { Body, Controller, Get, Post } from "@nestjs/common";
import { CustomResponse } from "src/customResponse/CustomResponse";
import { CodingEvaluationRequestDtoFe } from "src/submodules/Assessment-Platform-Dtos/src/dtos/codingEvaluation.dto";
import { CodeService } from "./code.service";

@Controller('code')
export class CodeController{

    constructor(
        private readonly codeService:CodeService
    ){}

    @Post('runCode')
    async runCode(@Body() codePayload:CodingEvaluationRequestDtoFe){
        try {
            await this.codeService.runCode(codePayload);
        } catch (error) {
            return new CustomResponse(500,`Running Code: Internal Error`,error);
        }        
    }
}