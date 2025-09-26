import { describe, it, expect } from "vitest";

//describe -> como eu escrevo esse teste
describe("Matemativa bsica", ()=>{
    //o que eu quero testar -> qual cenário de teste estou executando
    it("soma 2 + 2", ()=> {
        //o que eu espero como resposta
        expect(5 + 5).toBe(10)
    });
});