import { MessageBody, SubscribeMessage, WebSocketGateway} from "@nestjs/websockets";

@WebSocketGateway()
export class chatGateway{

    @SubscribeMessage('toChatServer')
    async handleThis(@MessageBody() body:{phoneNumber:string}){
        // this.server.emit('toChatClient',`PhoneNumber Entered: ${body.phoneNumber}`)
    }

}