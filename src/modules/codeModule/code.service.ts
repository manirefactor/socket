import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import axios from "axios";
import { CodingEvaluationRequestDtoFe, JudgeSubmission, JudgeSubmitDto } from "src/submodules/Assessment-Platform-Dtos/src/dtos/codingEvaluation.dto";
import { EvaluationResponseFe, Token } from "src/submodules/Assessment-Platform-Dtos/src/dtos/questionDraft.dto";
import { CodingQuestionDraft } from "src/submodules/Assessment-Platform-Entities/src/schemas/codingQuestionDraft.schema";
import { SocketGateway } from "../socket/gateway";
import { JudgeStatus } from "src/submodules/Assessment-Platform-Dtos/src/enums/judgeStatus.enum";

@Injectable()
export class CodeService{

    constructor(
        private socket:SocketGateway,
        @InjectModel('codingQuestionDraft') private readonly codingQuestionDraftModel:Model<CodingQuestionDraft>
    ){}

    async runCode(codePayload:CodingEvaluationRequestDtoFe){
        try {
            let sampleTestCases:any = await this.codingQuestionDraftModel.findOne({questionId:codePayload.questionId},{
                sampleCases:1,
            }).lean();
            
            if(!sampleTestCases || sampleTestCases.sampleCases.sampleTestCases.length<1 ||(codePayload && !codePayload.sourceCode)|| !codePayload.languageId){
                return null;
            }
    
            let judgePayload=[];
                let returningTestCases=[];
                sampleTestCases.sampleCases.sampleTestCases.map((testCase: { sampleInput: string; sampleOutput: string; })=>{
                    let judgeSubmissionPayload: JudgeSubmission={
                        language_id : codePayload.languageId,
                        source_code:codePayload.sourceCode,
                        /* the character \ is used to escape the special charater in mongo,that is the reason
                        for the \\n,  below replace function is written to replace the \\n with the \n */
                        stdin:testCase.sampleInput.replace(/\\n/g,'\n'),
                        expected_output:testCase.sampleOutput.replace(/\\n/g,'\n')
                    };
                    returningTestCases.push({input:judgeSubmissionPayload.stdin,output:judgeSubmissionPayload.expected_output})
                    judgePayload.push(judgeSubmissionPayload);
               })
    
               let judgeEvaluatedResponse = await this.judgeEvaluation({submissions:judgePayload});
    
               judgeEvaluatedResponse.map(async(submission,index)=>{
                submission['testCase']=returningTestCases[index]
                })
                //Creating Unique Event to Emit to Client.
                let unique_user_event = `${codePayload.userId}_${codePayload.examId}_${codePayload.questionId}`;
                await this.reCheckTokens(judgeEvaluatedResponse,unique_user_event);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async judgeEvaluation(evaluationPayload:JudgeSubmitDto){
        try {

            let generatedTokens:Token[] = (await axios.post(`https://judge-staging.refactor.academy/submissions/batch`,evaluationPayload)).data;
            console.log(`No.of Submissions for Evaluation: ${generatedTokens.length}`)

            let tokens:string='';
            generatedTokens.forEach(tokenObj => tokens += tokenObj.token+',');

            let evaluationResponse = (await axios.get(`https://judge-staging.refactor.academy/submissions/batch?tokens=${tokens}&base64_encoded=true`)).data;

            return evaluationResponse.submissions;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async reCheckTokens(payload: any[],event: string){
        try {
            let pending=[];
            if(payload.length<1){
                return this.socket.server.emit(event,{status:200,message:"Compilation Done!"});
            }
            await Promise.all(payload.map(async(submission)=>{
                    let submissionStatus = ((await axios.get(`https://judge-staging.refactor.academy/submissions/batch?tokens=${submission.token}&base64_encoded=true`)).data).submissions[0];
                    submissionStatus['testCase'] = submission.testCase;
                    if(submissionStatus.status.description == JudgeStatus.IN_QUEUE || submissionStatus.status.description == JudgeStatus.PROCESSING ){
                        pending.push(submissionStatus);
                    }
                    else{
                        this.socket.server.emit(event,submissionStatus)
                    }
                }
            ))
            console.log(`pending sample len: `,pending.length)
            console.log(`--------------------------------------------`)
            await this.reCheckTokens(pending,event)
        } catch (error) {
            console.log(error)
            throw error;
        }
    }
}