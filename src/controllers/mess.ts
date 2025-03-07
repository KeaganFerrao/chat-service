import { MessageService } from "src/interfaces/messages";

class MessageController {
    private service: MessageService;

    constructor(service: MessageService) {
        this.service = service;
    }

}