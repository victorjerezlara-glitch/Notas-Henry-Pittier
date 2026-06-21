document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const alertBox = document.getElementById("alert");

  alertBox.classList.add("d-none");

  // 1. Login en Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alertBox.className = "alert alert-danger";
    alertBox.textContent = "Credenciales incorrectas";
    alertBox.classList.remove("d-none");
    return;
  }

  // 2. Obtener token
  const token = data.session.access_token;

  // 3. Obtener datos del usuario desde la función
  const { data: userData, error: userError } = await supabase.functions.invoke(
    "users-get_user",
    {
      body: { user_id: data.user.id },
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (userError) {
    alertBox.className = "alert alert-danger";
    alertBox.textContent = "Error obteniendo datos del usuario";
    alertBox.classList.remove("d-none");
    return;
  }

  // 👇 CORRECCIÓN IMPORTANTE
  const userObj = JSON.parse(userData);
  const rol = userObj.rol;

  // 4. Redirección según rol
  if (rol === "superadmin" || rol === "directivo") {
    window.location.href = "../pages/directivo.html";
  } else if (rol === "docente") {
    window.location.href = "../pages/docente.html";
  } else {
    alertBox.className = "alert alert-warning";
    alertBox.textContent = "Rol no autorizado";
    alertBox.classList.remove("d-none");
  }
});
