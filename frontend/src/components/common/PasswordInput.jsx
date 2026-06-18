import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

const PasswordInput = ({ value, setValue }) => {
  const [isPassHidden, setIsPassHidden] = useState(true);

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200">
        <Lock className="size-4 text-slate-400" strokeWidth={2} />
      </div>
      {isPassHidden && (
        <div
          className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer transition-colors duration-200"
          onClick={() => setIsPassHidden(false)}
        >
          <EyeOff className="size-4 text-slate-400" strokeWidth={2} />
        </div>
      )}
      {!isPassHidden && (
        <div
          className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer transition-colors duration-200"
          onClick={() => setIsPassHidden(true)}
        >
          <Eye className="size-4 text-slate-400" strokeWidth={2} />
        </div>
      )}
      <input
        type={isPassHidden ? "password" : "text"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="••••••••"
        className="w-full h-9 pl-12 pr-4 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10 text-sm font-medium"
      />
    </div>
  );
};

export default PasswordInput;
