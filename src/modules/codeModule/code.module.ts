import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CodingQuestionDraftSchema } from "src/submodules/Assessment-Platform-Entities/src/schemas/codingQuestionDraft.schema";
import { SocketGateway } from "../socket/gateway";
import { CodeController } from "./code.controller";
import { CodeService } from "./code.service";
@Module({
    imports:[
        MongooseModule.forFeature([
            {name:'codingQuestionDraft',schema:CodingQuestionDraftSchema}
        ])
    ],
    providers:[CodeService,SocketGateway],
    controllers:[CodeController]
})
export class codeModule{}