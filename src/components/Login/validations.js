import * as yup from "yup";

const validations = yup.object().shape({
    email: yup.string().email("Geçerli bir email giriniz.").required(),
    password: yup.string().required("Şifrenizi giriniz"),
});

export default validations;