document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    try {
        const response = await fetch("http://127.0.0.1:8000/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({usuario, senha})
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("usuarioLogado", data.usuario);
            window.location.href = "monitor.html";
        } else {
            alert(data.detail || "Usuário ou senha errada!");
        }
    } catch (error) {
        alert("Erro de conexão com o servidor!");
    }
});