import {Plugins} from './plugins';
import {ITPAParams} from './generateTPAParams';
import {isCssVar, isNumber} from './utils/utils';

export function getProcessor({cssVars, plugins}: {cssVars: {[key: string]: string}; plugins: Plugins}) {
  function executeFunction(value: string): ReturnType<typeof getVarOrPrimitiveValue> {
    const functionSignature = plugins.getFunctionSignature(value);

    if (functionSignature) {
      return plugins.cssFunctions[functionSignature.funcName](
        ...functionSignature.args.map(arg => executeFunction(arg.trim()))
      );
    } else {
      return getVarOrPrimitiveValue(value);
    }
  }

  function getVarOrPrimitiveValue(varName: string): Function {
    if (isCssVar(varName)) {
      const varValue = cssVars[varName];
      let defaultVarValue;
      if (plugins.isSupportedFunction(varValue)) {
        defaultVarValue = executeFunction(varValue);
      } else {
        defaultVarValue = () => varValue;
      }

      return getDefaultValueOrValueFromSettings(varName, defaultVarValue);
    }

    return () => varName;
  }

  function getDefaultValueOrValueFromSettings(varName: string, defaultVarValue: Function) {
    return (tpaParams: ITPAParams) => {
      const varNameInSettings = varName.substring(2, varName.length);
      if (tpaParams.strings[varNameInSettings] && tpaParams.strings[varNameInSettings].value) {
        return tpaParams.strings[varNameInSettings].value;
      } else if (tpaParams.colors[varNameInSettings]) {
        return tpaParams.colors[varNameInSettings];
      } else if (tpaParams.fonts[varNameInSettings]) {
        return tpaParams.fonts[varNameInSettings];
      } else if (isNumber(tpaParams.numbers[varNameInSettings])) {
        return tpaParams.numbers[varNameInSettings];
      }
      //not found in settings
      return defaultVarValue(tpaParams);
    };
  }

  function process({part, tpaParams}: {part: string; tpaParams: ITPAParams}) {
    if (plugins.isSupportedFunction(part)) {
      const evaluationFunc = executeFunction(part);
      return evaluationFunc(tpaParams);
    }
    return part;
  }

  return {
    process,
  };
}
