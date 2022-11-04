import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CodingQuestionDraftSchema } from "src/submodules/Assessment-Platform-Entities/src/schemas/codingQuestionDraft.schema";
import { CodeGateway } from "./code.gateway";
import { CodeService } from "./code.service";
@Module({
    imports:[
        MongooseModule.forFeature([
            {name:'codingQuestionDraft',schema:CodingQuestionDraftSchema}
        ])
    ],
    providers:[CodeGateway,CodeService]
})
export class codeModule{}