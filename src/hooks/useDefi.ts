import { useContext } from "react";
import DefiContext from "@/providers/defi-context";

const useDefi = () => {
  return useContext(DefiContext);
};

export default useDefi;
