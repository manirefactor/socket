import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import axios from "axios";
import { Server } from "socket.io";
import { CodingEvaluationRequestDtoFe } from "src/submodules/Assessment-Platform-Dtos/src/dtos/codingEvaluation.dto";
import { JudgeStatus } from "src/submodules/Assessment-Platform-Dtos/src/enums/judgeStatus.enum";
import { CodeService } from "./code.service";

@WebSocketGateway()
export class CodeGateway{
    constructor(
        private codeService: CodeService
    ){}

    @WebSocketServer()
    server:Server

    onModuleInit(){
        this.server.on('connection',(socket)=>{
            console.log(`Socket ID: ${socket.id}`);
        })
    }
    
    @SubscribeMessage('runCode')
    async runCode(@MessageBody() codePayload:CodingEvaluationRequestDtoFe){
        try {
            let response = await this.codeService.runCode(codePayload);
            this.reCheckTokens(response.submissions)
        } catch (error) {
            this.server.emit('compileResponse',error)
        }        
    }

    async reCheckTokens(payload){
        try {
            let pending=[];
            if(payload.length<1){
                return
            }
            await Promise.all(payload.map(async(submission)=>{
                    let submissionStatus = ((await axios.get(`https://judge-staging.refactor.academy/submissions/batch?tokens=${submission.token}&base64_encoded=true`)).data).submissions[0];
                    submissionStatus['testCase'] = submission.testCase;
                    if(submissionStatus.status.description == JudgeStatus.IN_QUEUE || submissionStatus.status.description == JudgeStatus.PROCESSING ){
                        pending.push(submissionStatus);
                    }
                    else{
                        this.server.emit('compileResponse',submissionStatus)
                    }
                }
            ))
            console.log(`pending sample len: `,pending.length)
            console.log(`--------------------------------------------`)
            await this.reCheckTokens(pending)
        } catch (error) {
            console.log(error)
        }
    }
}