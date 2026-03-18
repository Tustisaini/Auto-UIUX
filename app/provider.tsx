"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserDetailContext } from "@/context/UserDetailContext";
import { SettingContext } from "@/context/SettingContext";
import { RefreshCcwDot } from "lucide-react";
import { RefreshDataContext } from "@/context/RefreshDataContext";

function Provider({ children }: any) {
  const [userDetail, setUserDetail] = useState<any>(null);
  const [settingsDetail, setSettingDetail] = useState<any>({});
const [refreshData,setRefreshData]=useState();

  useEffect(() => {
    CreateNewUser();
  }, []);

  const CreateNewUser = async () => {
    const result = await axios.post("/api/user", {});
    console.log("👤 USER CREATED:", result.data);
    setUserDetail(result?.data);
  };

  useEffect(() => {
    console.log("🎨 THEME UPDATED:", settingsDetail?.theme);
  }, [settingsDetail?.theme]);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <SettingContext.Provider value={{ settingsDetail, setSettingDetail }}>
        <RefreshDataContext.Provider value={{refreshData,setRefreshData}}>
          {children}
        </RefreshDataContext.Provider>
        
      </SettingContext.Provider>
    </UserDetailContext.Provider>
  );
}

export default Provider;