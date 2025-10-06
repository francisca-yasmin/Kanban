import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CadUsuario } from "../pages/CadUsuario";
import { describe, it, expect, vi } from "vitest";
import axios from "axios";

//Mock do axios para evitar requisições reais
vi.mock("axios");

describe("CadUsuario", () => {

  beforeEach(() => {
    // Evita alertas bloqueando o teste
    window.alert = vi.fn();
    // Limpa mocks entre os testes
    vi.clearAllMocks();
  });

  it("deve renderizar todos os campos do formulário", () => {
    render(<CadUsuario />);

    const nomeInput = screen.getByLabelText(/Nome/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const botao = screen.getByRole("button", { name: /Cadastrar/i });

    expect(nomeInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(botao).toBeTruthy();
  });

  it("deve mostrar erros quando campos estiverem vazios", async () => {
    render(<CadUsuario />);

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      // ⚠️ Ajuste as mensagens conforme as do seu schema Zod
      expect(screen.getByText("Insira ao menos 1 caractere")).toBeTruthy();
      expect(screen.getByText("Insira seu email")).toBeTruthy();
    });
  });

    it("deve mostrar erro quando o email tiver formato inválido", async () => {
        render(<CadUsuario />);

        // Nome válido completo para passar na validação de nome
        fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria Silva" } });
        fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: "emailinvalido" } });

        fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

        await waitFor(() => {
        expect(screen.getByText(/Formato de email inválido/i)).toBeTruthy();
        });
    });

    it("deve resetar os campos após submissão", async () => {
        // Mock de sucesso da API
        axios.post.mockResolvedValueOnce({ data: { message: "ok" } });

        render(<CadUsuario />);

        const nomeInput = screen.getByLabelText(/Nome/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const botao = screen.getByRole("button", { name: /Cadastrar/i });

        // Preenche os campos com valores válidos
        fireEvent.input(nomeInput, { target: { value: "Maria Silva" } });
        fireEvent.input(emailInput, { target: { value: "maria@email.com" } });

        // Clica no botão de submit
        fireEvent.click(botao);

        // Espera o alert ser chamado → garante que o submit assíncrono terminou
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Usuário cadastrado com sucesso");
        });

    // Agora o reset do formulário já foi aplicado
        expect(nomeInput.value).toBe("");
        expect(emailInput.value).toBe("");
    });


    // ************************************** TESTE PARA O CAMPO NOME **************************************
    it("deve mostrar erro se o nome tiver apenas um nome", async () => {
        render(<CadUsuario />);

        fireEvent.input(screen.getByLabelText(/Nome/i), {
        target: { value: "Maria" } // Apenas primeiro nome
        });

        fireEvent.input(screen.getByLabelText(/Email/i), {
        target: { value: "maria@email.com" } // Email válido
        });

        fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

        await waitFor(() => {
        expect(screen.getByText(/Digite nome completo/i)).toBeTruthy();
        });
    });

    it("deve mostrar erro se o nome contiver apenas espaços em branco", async () => {
        render(<CadUsuario />);

        fireEvent.input(screen.getByLabelText(/Nome/i), {
        target: { value: "    " } // Apenas espaços
        });

        fireEvent.input(screen.getByLabelText(/Email/i), {
        target: { value: "maria@email.com" } // Email válido
        });

        fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

        await waitFor(() => {
        expect(screen.getByText(/Digite nome completo/i)).toBeTruthy();
        });
    });

    it("deve aceitar nome completo válido", async () => {
        render(<CadUsuario />);

        fireEvent.input(screen.getByLabelText(/Nome/i), {
        target: { value: "Maria Silva" } // Nome completo
        });

        fireEvent.input(screen.getByLabelText(/Email/i), {
        target: { value: "maria@email.com" } // Email válido
        });

        fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

        await waitFor(() => {
        expect(screen.queryByText(/Digite nome completo/i)).toBeNull();
        });
    });

    it("deve mostrar um erro se tiver caracteres especiais", async () => {
        render(<CadUsuario />);

        // Insere um nome com caracteres inválidos
        fireEvent.input(screen.getByLabelText(/Nome/i), {
            target: { value: "Maria@123" } // caracteres especiais e números
        });

        // Preenche email válido para não atrapalhar a validação
        fireEvent.input(screen.getByLabelText(/Email/i), {
            target: { value: "maria@email.com" }
        });

        // Clica no botão de submit
        fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

        // Espera que o erro seja exibido
        await waitFor(() => {
            expect(screen.getByText(/Digite nome completo/i)).toBeTruthy();
        });
    });

    it("deve aceitar nome com múltiplos espaços entre nomes", async () => {
        render(<CadUsuario />);

        fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria   Silva" } });
        fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: "maria@email.com" } });

        fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

        await waitFor(() => {
            expect(screen.queryByText(/Digite nome completo/i)).toBeNull();
        });
    });

    it("não deve permitir enviar nome com espaços antes ou depois", async () => {
        render(<CadUsuario />);

        const nomeInput = screen.getByLabelText(/Nome/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar/i });

        // Nome com espaços extras
        fireEvent.input(nomeInput, { target: { value: "  Maria Silva  " } });

        // Email válido para não interferir na validação
        fireEvent.input(emailInput, { target: { value: "maria@email.com" } });

        // Tenta submeter o formulário
        fireEvent.click(botaoCadastrar);

        await waitFor(() => {
            // Garante que o alerta e a requisição não foram chamados
            expect(window.alert).not.toHaveBeenCalled();
            expect(axios.post).not.toHaveBeenCalled();
        });
    });

    it("não deve permitir enviar nome com mais de 100 caracteres", async () => {
        render(<CadUsuario />);

        const nomeInput = screen.getByLabelText(/Nome/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar/i });

        // Preenche o nome com 101 caracteres
        fireEvent.input(nomeInput, { target: { value: "A".repeat(101) } });
        // Email válido para passar na validação do email
        fireEvent.input(emailInput, { target: { value: "teste@email.com" } });

        // Tenta submeter
        fireEvent.click(botaoCadastrar);

        await waitFor(() => {
            expect(
                screen.getByText((content) =>
                    content.includes("Digite nome completo") &&
                    content.includes("sem números ou símbolos") &&
                    content.includes("sem espaços no início e fim"))
                ).toBeTruthy();
        });

        // Garante que o submit não foi feito
        expect(window.alert).not.toHaveBeenCalled();
        expect(axios.post).not.toHaveBeenCalled();
    });


    // ************************************** TESTE PARA O CAMPO EMAIL **************************************
    it("deve aceitar um email válido", async () => {
        render(<CadUsuario />);

        fireEvent.input(screen.getByLabelText(/Nome/i), {
        target: { value: "Maria Silva" }
        });

        fireEvent.input(screen.getByLabelText(/Email/i), {
        target: { value: "maria@email.com" }
        });

        fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

        await waitFor(() => {
        expect(screen.queryByText(/Formato de email inválido/i)).toBeNull();
        expect(screen.queryByText(/Insira seu email/i)).toBeNull();
        });
    });

    it("deve mostrar erro se o email exceder 255 caracteres", async () => {
        render(<CadUsuario />);

        fireEvent.input(screen.getByLabelText(/Nome/i), {
        target: { value: "Maria Silva" }
        });

        const longEmail = "a".repeat(256) + "@gmail.com"; // Total 255+ caracteres
        fireEvent.input(screen.getByLabelText(/Email/i), {
        target: { value: longEmail }
        });

        fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

        await waitFor(() => {
        expect(screen.getByText(/Formato de email inválido/i)).toBeTruthy();
        });
    });

    it("deve aceitar email válido dentro do limite", async () => {
        render(<CadUsuario />);

        const validEmail = "teste.valid@email.com";

        fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria Silva" } });
        fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: validEmail } });

        fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

        await waitFor(() => {
        expect(screen.queryByText("Insira seu email")).toBeNull();
        expect(screen.queryByText("Formato de email inválido")).toBeNull();
        expect(screen.queryByText("Insira um e-mail com até 255 caracteres")).toBeNull();
        });
    });

    it("deve mostrar erro se o email contiver apenas espaços em branco", async () => {
        render(<CadUsuario />);

        fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria Silva" } });
        fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: "    " } }); // apenas espaços

        fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

        await waitFor(() => {
            expect(screen.getByText("Insira seu email")).toBeTruthy();
        });
    });

    it("não deve permitir enviar email contendo apenas caracteres especiais", async () => {
        render(<CadUsuario />);

        const emailInput = screen.getByLabelText(/Email/i);
        const nomeInput = screen.getByLabelText(/Nome/i);
        const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar/i });

        // Preenche o nome corretamente (para passar na validação de nome)
        fireEvent.input(nomeInput, { target: { value: "Maria Silva" } });

        // Preenche o email apenas com caracteres especiais
        fireEvent.input(emailInput, { target: { value: "!@#$%^&*" } });

        // Tenta submeter o formulário
        fireEvent.click(botaoCadastrar);

        await waitFor(() => {
            // Verifica se a mensagem de erro de email aparece
            expect(screen.getByText(/Formato de email inválido/i)).toBeTruthy();
        });

        // Garante que o alert e o axios.post não foram chamados
        expect(window.alert).not.toHaveBeenCalled();
        expect(axios.post).not.toHaveBeenCalled();
    });

    it("não deve permitir enviar email com espaços antes ou depois", async () => {
        render(<CadUsuario />);

        fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria Silva" } });
        fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: "   maria@email.com  " } });

        fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

        // Verifica que alert e axios.post não foram chamados
        await waitFor(() => {
            expect(window.alert).not.toHaveBeenCalled();
            expect(axios.post).not.toHaveBeenCalled();
        });
    });

});