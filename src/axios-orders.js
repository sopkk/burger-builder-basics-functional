import axios from "axios";

const instance = axios.create({
  baseURL: "https://my-burger-9006a.firebaseio.com/"
});

export default instance;
