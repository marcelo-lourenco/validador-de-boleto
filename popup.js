

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById('mensagem2').style.display = 'none';
  document.getElementById('result').style.display = 'none';

  /**
  * Copia o conteúdo de texto de um campo de entrada para a área de transferência quando o ícone associado é clicado.
  * @param {MouseEvent} evento - O evento de clique.
  */
  var copyIcons = document.querySelectorAll(".icon-copy");
  var tooltip = document.querySelector(".tooltip");
  copyIcons.forEach(function (copyIcon) {
    copyIcon.addEventListener("click", function () {
      var inputField = this.parentElement.querySelector('input[type="text"]');
      inputField.select();
      document.execCommand("copy");
      window.getSelection().removeAllRanges();
      tooltip.style.display = "inline-block";
      setTimeout(function () {
        tooltip.style.display = "none";
      }, 2000);
    });
  });


  function atualizarContadorCodigo() {
    const inputCodigo = document.getElementById("codigo");
    const contadorCodigo = document.getElementById("fldContador");
    const numeros = inputCodigo.value.match(/\d/g);
    contadorCodigo.textContent = numeros ? numeros.length : 0;
  }

  document.getElementById("codigo").addEventListener("input", atualizarContadorCodigo);

  document.getElementById("btnValidar").addEventListener("click", () => {
    validarCodigo(document.getElementById('codigo').value)
  });


  function mostrarAviso() {
    document.getElementById('mensagem').style.display = 'none';
    document.getElementById('result').style.display = 'none';
    document.getElementById('mensagem2').style.display = 'block';
  }

  /* document.getElementById("lnkAtencao").addEventListener("click", mostrarAviso); */
  document.getElementById("icon-warning").addEventListener("click", mostrarAviso);

  function validarCodigo(codigo) {

    const resultado = validarBoleto(codigo);
    /* document.getElementById('status').textContent = resultado.sucesso; */
    document.getElementById('mensagem').textContent = resultado.mensagem;
    if (resultado.tipoCodigoInput == "Código de Barras") {
      document.getElementById('divCodigoBarras').style.display = 'none';
      document.getElementById('divLinhaDigitavel').style.display = 'block';

      let mascara;
      if (resultado.linhaDigitavel.length === 47) {
        // Formato para boletos com dígito verificador
        mascara = resultado.linhaDigitavel.replace(/^(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{14})$/, '$1.$2 $3.$4 $5.$6 $7 $8');
      } else if (resultado.linhaDigitavel.length === 48) {
        // Formato para boletos sem dígito verificador
        mascara = resultado.linhaDigitavel.replace(/^(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{2})(\d{11})$/, '$1.$2 $3.$4 $5.$6 $7 $8');
      } else {
        // Caso não corresponda aos tamanhos esperados
        mascara = resultado.linhaDigitavel;
      }

      document.getElementById('linhaDigitavel').value = mascara;

    } else if (resultado.tipoCodigoInput == "Linha Digitável") {
      let mascara = resultado.codigoBarras.replace(/(\d{11})(\d{11})(\d{11})(\d{11})/, '$1 $2 $3 $4');
      document.getElementById('divLinhaDigitavel').style.display = 'none';
      document.getElementById('divCodigoBarras').style.display = 'block';
      document.getElementById('codigoBarras').value = mascara;
    }


    document.getElementById('tipoCodigoInput').value = resultado.tipoCodigoInput;
    document.getElementById('tipoBoleto').value = resultado.tipoBoleto;


    document.getElementById('vencimento').value = resultado.vencimento;
    document.getElementById('valor').value = resultado.valor;

    if (resultado.sucesso) {
      document.getElementById('mensagem').style.display = 'none';
      document.getElementById('result').style.display = 'block';
      document.getElementById('mensagem2').style.display = 'none';
    } else {
      document.getElementById('mensagem').style.display = 'block';
      mensagem.className = 'message-error message ln';
      document.getElementById('result').style.display = 'none';
      document.getElementById('mensagem2').style.display = 'none';

    }

    const iconContainer = document.getElementById('iconContainer');
    iconContainer.innerHTML = ''; // Limpa qualquer ícone existente

    const icon = document.createElement('div');
    icon.className = resultado.sucesso ? 'icon-check' : 'icon-error';
    iconContainer.appendChild(icon);


    // elementos onde serão exibidas as imegems dos código de barras
    var imgCodigoBarras = document.getElementById("imgCodigoBarras");
    var imgLinhaDigitavel = document.getElementById("imgLinhaDigitavel");

    const barCodeParams = {
      format: "CODE128",
      displayValue: true,
      lineColor: "#000",
      width: 1.5,
      height: 25,
      fontSize: 16
    }
    JsBarcode(imgCodigoBarras, resultado.codigoBarras, barCodeParams);
    JsBarcode(imgLinhaDigitavel, resultado.linhaDigitavel, barCodeParams);
  }

  function limparResult() {
    /* document.getElementById('status').textContent = ''; */
    document.getElementById('mensagem').value = '';
    document.getElementById('tipoCodigoInput').value = '';
    document.getElementById('tipoBoleto').value = '';
    document.getElementById('codigoBarras').value = '';
    document.getElementById('linhaDigitavel').value = '';
    document.getElementById('vencimento').value = '';
    document.getElementById('valor').value = '';
  }


  /**
  * Identifica o tipo de código inserido (se baseando na quantidade de dígitos).
  * @param {string} codigo Numeração do boleto
  * @return {string} CODIGO_DE_BARRAS
  * @return {string} LINHA_DIGITAVEL
  * @return {string} TAMANHO_INCORRETO
  */
  let identificarTipoCodigo = (codigo) => {
    if (typeof codigo !== 'string') throw new TypeError('Insira uma string válida!');

    codigo = codigo.replace(/[^0-9]/g, '');

    if (codigo.length == 44) {
      return 'CODIGO_DE_BARRAS'
    } else if (codigo.length == 46 || codigo.length == 47 || codigo.length == 48) {
      return 'LINHA_DIGITAVEL'
    } else {
      return 'TAMANHO_INCORRETO';
    }
  }

  /**
   * Identifica o tipo de boleto inserido a partir da validação de seus dois dígitos iniciais.
   * @param {string} codigo Numeração do boleto
   * @return {string} BANCO
   * @return {string} ARRECADACAO_PREFEITURA
   * @return {string} ARRECADACAO_ORGAOS_GOVERNAMENTAIS
   * @return {string} ARRECADACAO_TAXAS_DE_TRANSITO
   * @return {string} CONVENIO_SANEAMENTO
   * @return {string} CONVENIO_ENERGIA_ELETRICA_E_GAS
   * @return {string} CONVENIO_TELECOMUNICACOES
   * @return {string} OUTROS
   * @return {string} CARTAO_DE_CREDITO
   */
  let identificarTipoBoleto = (codigo) => {
    codigo = codigo.replace(/[^0-9]/g, '');

    if (typeof codigo !== 'string') throw new TypeError('Insira uma string válida!');

    if (codigo.substr(-14) == '00000000000000' || codigo.substr(5, 14) == '00000000000000') {
      return 'CARTAO_DE_CREDITO';
    } else if (codigo.substr(0, 1) == '8') {
      if (codigo.substr(1, 1) == '1') {
        return 'ARRECADACAO_PREFEITURA';
      } else if (codigo.substr(1, 1) == '2') {
        return 'CONVENIO_SANEAMENTO';
      } else if (codigo.substr(1, 1) == '3') {
        return 'CONVENIO_ENERGIA_ELETRICA_E_GAS';
      } else if (codigo.substr(1, 1) == '4') {
        return 'CONVENIO_TELECOMUNICACOES';
      } else if (codigo.substr(1, 1) == '5') {
        return 'ARRECADACAO_ORGAOS_GOVERNAMENTAIS';
      } else if (codigo.substr(1, 1) == '6' || codigo.substr(1, 1) == '9') {
        return 'OUTROS';
      } else if (codigo.substr(1, 1) == '7') {
        return 'ARRECADACAO_TAXAS_DE_TRANSITO';
      }
    } else {
      return 'BANCO';
    }
  }

  /**
   * Identifica o código de referência do boleto para determinar qual módulo
   * será utilizado para calcular os dígitos verificadores
   * @param {string} codigo Numeração do boleto
   * @return {json} {mod, efetivo}
   */
  let identificarReferencia = (codigo) => {
    codigo = codigo.replace(/[^0-9]/g, '');

    const referencia = codigo.substr(2, 1);

    if (typeof codigo !== 'string') throw new TypeError('Insira uma string válida!');

    switch (referencia) {
      case '6':
        return {
          mod: 10,
          efetivo: true
        };
        break;
      case '7':
        return {
          mod: 10,
          efetivo: false
        };
        break;
      case '8':
        return {
          mod: 11,
          efetivo: true
        };
        break;
      case '9':
        return {
          mod: 11,
          efetivo: false
        };
        break;
      default:
        break;
    }
  }

  /**
   * Identifica o fator da data de vencimento do boleto
   * @param {string} codigo Numeração do boleto
   * @param {string} tipoCodigo tipo de código inserido (CODIGO_DE_BARRAS / LINHA_DIGITAVEL)
   * @return {Date} dataBoleto
   */
  function fatorVencimento(fatorVencimento) {
    const dataBaseInicial = new Date(1997, 9, 7); // 07/10/1997
    const dataBaseNovoCiclo = new Date(2025, 1, 22); // 22/02/2025 (Novo ciclo começa)

    const fatorInt = parseInt(fatorVencimento);

    // TODO Makeshift: 5000, equivale a 16/06/2011 e a fronteira deveria ser em 9999. Porém, pode afetar boletos vencidos no últimos anos
    if (fatorInt >= 1000 && fatorInt <= 5000) {
      // Se o fator está entre 1000 e 9999 (Ciclo novo a partir de 22/02/2025)
      const diasAdicionais = fatorInt - 1000;
      dataBaseNovoCiclo.setDate(dataBaseNovoCiclo.getDate() + diasAdicionais);
      return dataBaseNovoCiclo.toLocaleDateString('pt-BR'); // Formato dd/mm/aaaa
    } else {
      // Fator de vencimento válido entre 0 e 999 (ciclo antigo antes de 22/02/2025)
      const diasAdicionais = fatorInt;
      dataBaseInicial.setDate(dataBaseInicial.getDate() + diasAdicionais);
      return dataBaseInicial.toLocaleDateString('pt-BR'); // Formato dd/mm/aaaa
    }
  }

  let identificarData = (codigo, tipoCodigo) => {
    codigo = codigo.replace(/[^0-9]/g, '');
    const tipoBoleto = identificarTipoBoleto(codigo);
    let fatorData = '';

    if (tipoCodigo === 'CODIGO_DE_BARRAS') {
      if (tipoBoleto === 'BANCO' || tipoBoleto === 'CARTAO_DE_CREDITO') {
        fatorData = codigo.substr(5, 4);
        console.log(fatorData)
      } else {
        fatorData = '0';
      }
    } else if (tipoCodigo === 'LINHA_DIGITAVEL') {
      if (tipoBoleto === 'BANCO' || tipoBoleto === 'CARTAO_DE_CREDITO') {
        fatorData = codigo.substr(33, 4);
      } else {
        fatorData = '0';
      }
    }


    if (tipoCodigo === 'CODIGO_DE_BARRAS') {
      fatorData = codigo.substr(5, 4);
    } else if (tipoCodigo === 'LINHA_DIGITAVEL') {
      fatorData = codigo.substr(33, 4);
    }

    const dataBoleto = fatorVencimento(fatorData);

    return dataBoleto;
  };


  /**
   * Identifica o valor no CÓDIGO DE BARRAS do boleto do tipo 'Arrecadação'
   * @param {string} codigo Numeração do boleto
   * @param {string} tipoCodigo tipo de código inserido (CODIGO_DE_BARRAS / LINHA_DIGITAVEL)
   * @return {string} valorFinal
   */
  let identificarValorCodBarrasArrecadacao = (codigo, tipoCodigo) => {
    codigo = codigo.replace(/[^0-9]/g, '');
    const isValorEfetivo = identificarReferencia(codigo).efetivo;

    let valorBoleto = '';
    let valorFinal;

    if (isValorEfetivo) {
      if (tipoCodigo == 'LINHA_DIGITAVEL') {
        valorBoleto = codigo.substr(4, 14);
        valorBoleto = codigo.split('');
        valorBoleto.slice(11, 1);
        valorBoleto = valorBoleto.join('');
        valorBoleto = valorBoleto.substr(4, 11);
      } else if (tipoCodigo == 'CODIGO_DE_BARRAS') {
        valorBoleto = codigo.substr(4, 11);
      }

      valorFinal = valorBoleto.substr(0, 9) + '.' + valorBoleto.substr(9, 2);

      let char = valorFinal.substr(1, 1);
      while (char === '0') {
        valorFinal = substringReplace(valorFinal, '', 0, 1);
        char = valorFinal.substr(1, 1);
      }

    } else {
      valorFinal = 0;
    }

    return valorFinal;
  }

  /**
   * Identifica o valor no boleto inserido
   * @param {string} codigo Numeração do boleto
   * @param {string} tipoCodigo tipo de código inserido (CODIGO_DE_BARRAS / LINHA_DIGITAVEL)
   * @return {float} valorFinal
   */
  let identificarValor = (codigo, tipoCodigo) => {

    const tipoBoleto = identificarTipoBoleto(codigo);

    let valorBoleto = '';
    let valorFinal;

    if (tipoCodigo == 'CODIGO_DE_BARRAS') {
      if (tipoBoleto == 'BANCO' || tipoBoleto == 'CARTAO_DE_CREDITO') {
        valorBoleto = codigo.substr(9, 10);
        valorFinal = valorBoleto.substr(0, 8) + '.' + valorBoleto.substr(8, 2);

        let char = valorFinal.substr(1, 1);
        while (char === '0') {
          valorFinal = substringReplace(valorFinal, '', 0, 1);
          char = valorFinal.substr(1, 1);
        }
      } else {
        valorFinal = identificarValorCodBarrasArrecadacao(codigo, 'CODIGO_DE_BARRAS');
      }

    } else if (tipoCodigo == 'LINHA_DIGITAVEL') {
      if (tipoBoleto == 'BANCO' || tipoBoleto == 'CARTAO_DE_CREDITO') {
        valorBoleto = codigo.substr(37);
        valorFinal = valorBoleto.substr(0, 8) + '.' + valorBoleto.substr(8, 2);

        let char = valorFinal.substr(1, 1);
        while (char === '0') {
          valorFinal = substringReplace(valorFinal, '', 0, 1);
          char = valorFinal.substr(1, 1);
        }
      } else {
        valorFinal = identificarValorCodBarrasArrecadacao(codigo, 'LINHA_DIGITAVEL');
      }
    }
    return parseFloat(valorFinal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  /**
   * Define qual módulo deverá ser utilizado para calcular os dígitos verificadores
   * @param {string} codigo Numeração do boleto
   * @param {int} mod Modulo 10 ou Modulo 11
   * @return {string} digitoVerificador
   */
  let digitosVerificadores = (codigo, mod) => {
    codigo = codigo.replace(/[^0-9]/g, '');
    switch (mod) {
      case 10:
        return (codigo + calculaMod10(codigo)).toString();
        break;
      case 11:
        return (codigo + calculaMod11(codigo)).toString();
        break;
      default:
        break;
    }
  }

  /**
   * Converte a numeração do código de barras em linha digitável
   * @param {string} codigo Numeração do boleto
   * @param {boolean} formatada Gerar numeração convertida com formatação (formatado = true / somente números = false)
   * @return {string} resultado
   */
  let codBarras2LinhaDigitavel = (codigo, formatada) => {
    codigo = codigo.replace(/[^0-9]/g, '');

    const tipoBoleto = identificarTipoBoleto(codigo);

    let resultado = '';

    if (tipoBoleto == 'BANCO' || tipoBoleto == 'CARTAO_DE_CREDITO') {
      const novaLinha = codigo.substr(0, 4) + codigo.substr(19, 25) + codigo.substr(4, 1) + codigo.substr(5, 14);

      const bloco1 = novaLinha.substr(0, 9) + calculaMod10(novaLinha.substr(0, 9));
      const bloco2 = novaLinha.substr(9, 10) + calculaMod10(novaLinha.substr(9, 10));
      const bloco3 = novaLinha.substr(19, 10) + calculaMod10(novaLinha.substr(19, 10));
      const bloco4 = novaLinha.substr(29);

      resultado = (bloco1 + bloco2 + bloco3 + bloco4).toString();

      if (formatada) {
        resultado =
          resultado.slice(0, 5) +
          '.' +
          resultado.slice(5, 10) +
          ' ' +
          resultado.slice(10, 15) +
          '.' +
          resultado.slice(15, 21) +
          ' ' +
          resultado.slice(21, 26) +
          '.' +
          resultado.slice(26, 32) +
          ' ' +
          resultado.slice(32, 33) +
          ' ' +
          resultado.slice(33);
      }
    } else {
      const identificacaoValorRealOuReferencia = identificarReferencia(codigo);
      let bloco1;
      let bloco2;
      let bloco3;
      let bloco4;

      if (identificacaoValorRealOuReferencia.mod == 10) {
        bloco1 = codigo.substr(0, 11) + calculaMod10(codigo.substr(0, 11));
        bloco2 = codigo.substr(11, 11) + calculaMod10(codigo.substr(11, 11));
        bloco3 = codigo.substr(22, 11) + calculaMod10(codigo.substr(22, 11));
        bloco4 = codigo.substr(33, 11) + calculaMod10(codigo.substr(33, 11));
      } else if (identificacaoValorRealOuReferencia.mod == 11) {
        bloco1 = codigo.substr(0, 11) + calculaMod11(codigo.substr(0, 11));
        bloco2 = codigo.substr(11, 11) + calculaMod11(codigo.substr(11, 11));
        bloco3 = codigo.substr(22, 11) + calculaMod11(codigo.substr(22, 11));
        bloco4 = codigo.substr(33, 11) + calculaMod11(codigo.substr(33, 11));
      }

      resultado = bloco1 + bloco2 + bloco3 + bloco4;
    }

    return resultado;
  }

  /**
   * Converte a numeração da linha digitável em código de barras
   * @param {string} codigo Numeração do boleto
   * @return {string} resultado
   */
  let linhaDigitavel2CodBarras = (codigo) => {
    codigo = codigo.replace(/[^0-9]/g, '');

    const tipoBoleto = identificarTipoBoleto(codigo);

    let resultado = '';

    if (tipoBoleto == 'BANCO' || tipoBoleto == 'CARTAO_DE_CREDITO') {
      resultado = codigo.substr(0, 4) +
        codigo.substr(32, 1) +
        codigo.substr(33, 14) +
        codigo.substr(4, 5) +
        codigo.substr(10, 10) +
        codigo.substr(21, 10);
    } else {

      codigo = codigo.split('');
      codigo.splice(11, 1);
      codigo.splice(22, 1);
      codigo.splice(33, 1);
      codigo.splice(44, 1);
      codigo = codigo.join('');

      resultado = codigo;
    }

    return resultado;
  }

  /**
   * Calcula o dígito verificador de toda a numeração do código de barras
   * @param {string} codigo Numeração do boleto
   * @param {int} posicaoCodigo Posição onde deve se encontrar o dígito verificador
   * @param {int} mod Módulo 10 ou Módulo 11
   * @return {string} numero
   */
  let calculaDVCodBarras = (codigo, posicaoCodigo, mod) => {
    codigo = codigo.replace(/[^0-9]/g, '');

    codigo = codigo.split('');
    codigo.splice(posicaoCodigo, 1);
    codigo = codigo.join('');

    if (mod === 10) {
      return calculaMod10(codigo);
    } else if (mod === 11) {
      return calculaMod11(codigo);
    }
  }

  /**
   * Informa se o código de barras inserido é válido, calculando seu dígito verificador.
   * @param {string} codigo Numeração do boleto
   * @return {boolean} true = boleto válido / false = boleto inválido
   */
  let validarCodigoComDV = (codigo, tipoCodigo) => {

    codigo = codigo.replace(/[^0-9]/g, '');
    let tipoBoleto;

    let resultado;

    if (tipoCodigo === 'LINHA_DIGITAVEL') {
      tipoBoleto = identificarTipoBoleto(codigo, 'LINHA_DIGITAVEL');

      if (tipoBoleto == 'BANCO' || tipoBoleto == 'CARTAO_DE_CREDITO') {
        const bloco1 = codigo.substr(0, 9) + calculaMod10(codigo.substr(0, 9));
        const bloco2 = codigo.substr(10, 10) + calculaMod10(codigo.substr(10, 10));
        const bloco3 = codigo.substr(21, 10) + calculaMod10(codigo.substr(21, 10));
        const bloco4 = codigo.substr(32, 1);
        const bloco5 = codigo.substr(33);

        resultado = (bloco1 + bloco2 + bloco3 + bloco4 + bloco5).toString();
      } else {
        const identificacaoValorRealOuReferencia = identificarReferencia(codigo);
        let bloco1;
        let bloco2;
        let bloco3;
        let bloco4;

        if (identificacaoValorRealOuReferencia.mod == 10) {
          bloco1 = codigo.substr(0, 11) + calculaMod10(codigo.substr(0, 11));
          bloco2 = codigo.substr(12, 11) + calculaMod10(codigo.substr(12, 11));
          bloco3 = codigo.substr(24, 11) + calculaMod10(codigo.substr(24, 11));
          bloco4 = codigo.substr(36, 11) + calculaMod10(codigo.substr(36, 11));
        } else if (identificacaoValorRealOuReferencia.mod == 11) {
          bloco1 = codigo.substr(0, 11);
          bloco2 = codigo.substr(12, 11);
          bloco3 = codigo.substr(24, 11);
          bloco4 = codigo.substr(36, 11);

          let dv1 = parseInt(codigo.substr(11, 1));
          let dv2 = parseInt(codigo.substr(23, 1));
          let dv3 = parseInt(codigo.substr(35, 1));
          let dv4 = parseInt(codigo.substr(47, 1));
          //console.log(dv1)
          //console.log(calculaMod11(bloco1))
          //console.log(dv2)
          //console.log(calculaMod11(bloco2))
          //console.log(dv3)
          //console.log(calculaMod11(bloco3))
          //console.log(dv4)
          //console.log(calculaMod11(bloco4))

          let valid = (calculaMod11(bloco1) == dv1 &&
            calculaMod11(bloco2) == dv2 &&
            calculaMod11(bloco3) == dv3 &&
            calculaMod11(bloco4) == dv4)

          return valid;
        }

        resultado = bloco1 + bloco2 + bloco3 + bloco4;
      }
    } else if (tipoCodigo === 'CODIGO_DE_BARRAS') {
      tipoBoleto = identificarTipoBoleto(codigo);

      if (tipoBoleto == 'BANCO' || tipoBoleto == 'CARTAO_DE_CREDITO') {
        const DV = calculaDVCodBarras(codigo, 4, 11);
        resultado = codigo.substr(0, 4) + DV + codigo.substr(5);
      } else {
        const identificacaoValorRealOuReferencia = identificarReferencia(codigo);

        resultado = codigo.split('');
        resultado.splice(3, 1);
        resultado = resultado.join('');

        const DV = calculaDVCodBarras(codigo, 3, identificacaoValorRealOuReferencia.mod);
        resultado = resultado.substr(0, 3) + DV + resultado.substr(3);

      }
    }
    return codigo === resultado;
  }

  /**
   * Gerar código de barras já realizando o cálculo do dígito verificador
   * @param {string} novoCodigo Numeração do boleto
   * @return {string} numero
   */
  let geraCodBarras = (codigo) => {
    codigo = codigo.replace(/[^0-9]/g, '');

    const tipoBoleto = identificarTipoBoleto(codigo);

    let novoCodigo;

    novoCodigo = linhaDigitavel2CodBarras(codigo);
    novoCodigo = novoCodigo.split('');
    novoCodigo.splice(4, 1);
    novoCodigo = novoCodigo.join('');
    let dv = calculaMod11(novoCodigo);
    novoCodigo = novoCodigo.substr(0, 4) + dv + novoCodigo.substr(4);

    return novoCodigo;
  }

  /**
   * ## __`BOLETO COBRANÇA`__
   * ### __AS POSIÇÕES AQUI MENCIONADAS PARTEM DO NÚMERO 0 E NÃO DO 1, A FIM DE FACILITAR O ENTENDIMENTO LÓGICO__
   * ---------------------------------------------------------
   *
   * ### __TIPO:__ CÓDIGO DE BARRAS (44 POSIÇÕES NUMÉRICAS)
   *
   * ---------------------------------------------------------
   *
   * #### __EXEMPLO:__ 11123444455555555556666666666666666666666666
   *
   * Bloco | Posições | Definição
   * --- | --- | ---
   * __1__ | **0 a 2**  | `Código do Banco na Câmara de Compensação`
   * __2__ | **3 a 3**  | `Código da Moeda = 9 (Real)`
   * __3__ | **4 a 4**  | `Digito Verificador (DV) do código de Barras`
   * __4__ | **5 a 8**  | `Fator de Vencimento`
   * __5__ | **9 a 18**  | `Valor com 2 casas de centavos`
   * __6__ | **19 a 43**  | `Campo Livre (De uso da instituição bancária)`
   *
   * ---------------------------------------------------------
   *
   * ### __TIPO:__ LINHA DIGITÁVEL (47 POSIÇÕES NUMÉRICAS)
   *
   * ---------------------------------------------------------
   *
   * #### __EXEMPLO__: AAABC.CCCCX DDDDD.DDDDDY EEEEE.EEEEEZ K UUUUVVVVVVVVVV
   *
   * Campo | Posições linha dig. | Definição
   * --- | --- | ---
   * __A__ | **0 a 2** (0 a 2 do cód. barras)  | `Código do Banco na Câmara de compensação`
   * __B__ | **3 a 3** (3 a 3 do cód. barras)  | `Código da moeda`
   * __C__ | **4 a 8** (19 a 23 do cód. barras)  | `Campo Livre`
   * __X__ | **9 a 9**  | `Dígito verificador do Bloco 1 (Módulo 10)`
   * __D__ | **10 a 19** (24 a 33 do cód. barras)  | `Campo Livre`
   * __Y__ | **20 a 20**  | `Dígito verificador do Bloco 2 (Módulo 10)`
   * __E__ | **21 a 30** (24 a 43 do cód. barras)  | `Campo Livre`
   * __Z__ | **31 a 31**  | `Dígito verificador do Bloco 3 (Módulo 10)`
   * __K__ | **32 a 32** (4 a 4 do cód. barras)  | `Dígito verificador do código de barras`
   * __U__ | **33 a 36** (5 a 8 do cód. barras)  | `Fator de Vencimento`
   * __V__ | **37 a 43** (9 a 18 do cód. barras)  | `Valor`
   *
   * ## __`CONTA CONVÊNIO / ARRECADAÇÃO`__
   *
   * ---------------------------------------------------------
   *
   * ### __TIPO:__ CÓDIGO DE BARRAS (44 POSIÇÕES NUMÉRICAS)
   *
   * ---------------------------------------------------------
   *
   * #### __EXEMPLO__: 12345555555555566667777777777777777777777777
   *
   * Campo | Posições | Definição
   * --- | --- | ---
   * __1__ | **0 a 0**  | `"8" Identificação da Arrecadação/convênio`
   * __2__ | **1 a 1**  | `Identificação do segmento`
   * __3__ | **2 a 2**  | `Identificação do valor real ou referência`
   * __4__ | **3 a 3**  | `Dígito verificador geral (módulo 10 ou 11)`
   * __5__ | **4 a 14**  | `Valor efetivo ou valor referência`
   * __6__ | **15 a 18**  | `Identificação da empresa/órgão`
   * __7__ | **19 a 43**  | `Campo livre de utilização da empresa/órgão`
   *
   * ---------------------------------------------------------
   *
   * ### __TIPO:__ LINHA DIGITÁVEL (48 POSIÇÕES NUMÉRICAS)
   *
   * ---------------------------------------------------------
   *
   * #### __EXEMPLO__: ABCDEEEEEEE-W EEEEFFFFGGG-X GGGGGGGGGGG-Y GGGGGGGGGGG-Z
   *
   * Campo | Posições | Definição
   * --- | --- | ---
   * __A__ | **0 a 0**  | `"8" Identificação da Arrecadação/convênio`
   * __B__ | **1 a 1**  | `Identificação do segmento`
   * __C__ | **2 a 2**  | `Identificação do valor real ou referência`
   * __D__ | **3 a 3**  | `Dígito verificador geral (módulo 10 ou 11)`
   * __E__ | **4 a 14**  | `Valor efetivo ou valor referência`
   * __W__ | **11 a 11**  | `Dígito verificador do Bloco 1`
   * __F__ | **15 a 18**  | `Identificação da empresa/órgão`
   * __G__ | **19 a 43**  | `Campo livre de utilização da empresa/órgão`
   * __X__ | **23 a 23**  | `Dígito verificador do Bloco 2`
   * __Y__ | **35 a 35**  | `Dígito verificador do Bloco 3`
   * __Z__ | **47 a 47**  | `Dígito verificador do Bloco 4`
   */
  let validarBoleto = (codigo) => {
    codigo = codigo.replace(/[^0-9]/g, '');
    let tipoCodigo = identificarTipoCodigo(codigo);
    let retorno = {};
    /** 
     * Boletos de cartão de crédito geralmente possuem 46 dígitos. É necessário adicionar mais um zero no final, para formar 47 caracteres 
     * Alguns boletos de cartão de crédito do Itaú possuem 36 dígitos. É necessário acrescentar 11 zeros no final.
     */
    if (codigo.length == 36) {
      codigo = codigo + '00000000000';
    } else if (codigo.length == 46) {
      codigo = codigo + '0';
    }

    if (codigo.length != 44 && codigo.length != 46 && codigo.length != 47 && codigo.length != 48) {
      retorno.sucesso = false;
      retorno.codigoInput = codigo;
      retorno.mensagem = 'Numeração inválida.\nO código inserido possui ' + codigo.length + ' números.\n\nCÓDIGOS DE BARRAS devem ter 44 caracteres numéricos. \n\nLINHAS DIGITÁVEIS devem ter as seguintes quatidades de números:\n 46 (boletos de cartão de crédito);\n 47 (boletos bancários/cobrança);\n 48 (contas convênio/arrecadação). \n\nQualquer caractere não numérico será desconsiderado.';
      retorno.tipoCodigoInput = 'TAMANHO INCORRETO';
    } else if (codigo.substr(0, 1) == '8' && codigo.length == 46 && codigo.length == 47) {
      retorno.sucesso = false;
      retorno.codigoInput = codigo;
      retorno.mensagem = 'Este tipo de boleto deve possuir um código de barras 44 caracteres numéricos. Ou linha digitável de 48 caracteres numéricos.';
    } else if (!validarCodigoComDV(codigo, tipoCodigo)) {
      retorno.sucesso = false;
      retorno.codigoInput = codigo;
      retorno.mensagem = 'A validação do dígito verificador falhou. Tem certeza que inseriu a numeração correta?';
    } else {
      retorno.sucesso = true;
      retorno.codigoInput = codigo;
      retorno.mensagem = 'Boleto válido';

      switch (tipoCodigo) {
        case 'LINHA_DIGITAVEL':
          retorno.tipoCodigoInput = 'Linha Digitável';
          retorno.tipoBoleto = identificarTipoBoleto(codigo, 'LINHA_DIGITAVEL');
          retorno.codigoBarras = linhaDigitavel2CodBarras(codigo);
          retorno.linhaDigitavel = codigo;
          retorno.vencimento = identificarData(codigo, 'LINHA_DIGITAVEL');
          retorno.valor = identificarValor(codigo, 'LINHA_DIGITAVEL');
          break;
        case 'CODIGO_DE_BARRAS':
          retorno.tipoCodigoInput = 'Código de Barras';
          retorno.tipoBoleto = identificarTipoBoleto(codigo, 'CODIGO_DE_BARRAS');
          retorno.codigoBarras = codigo;
          retorno.linhaDigitavel = codBarras2LinhaDigitavel(codigo, false);
          retorno.vencimento = identificarData(codigo, 'CODIGO_DE_BARRAS');
          retorno.valor = identificarValor(codigo, 'CODIGO_DE_BARRAS');
          break;
        default:
          break;
      }
    }

    return retorno;
  }

  /**
   * Calcula o dígito verificador de uma numeração a partir do módulo 10
   * @param {string} numero Numeração
   * @return {string} soma
   */
  let calculaMod10 = (numero) => {
    numero = numero.replace(/\D/g, '');
    var i;
    var mult = 2;
    var soma = 0;
    var s = '';

    for (i = numero.length - 1; i >= 0; i--) {
      s = (mult * parseInt(numero.charAt(i))) + s;
      if (--mult < 1) {
        mult = 2;
      }
    }
    for (i = 0; i < s.length; i++) {
      soma = soma + parseInt(s.charAt(i));
    }
    soma = soma % 10;
    if (soma != 0) {
      soma = 10 - soma;
    }
    return soma;
  }

  /**
   * Calcula o dígito verificador de uma numeração a partir do módulo 11
   * @param {string} x Numeração
   * @return {string} digito
   */
  let calculaMod11 = (x) => {
    let sequencia = [4, 3, 2, 9, 8, 7, 6, 5];
    let digit = 0;
    let j = 0;
    let DAC = 0;

    //FEBRABAN https://cmsportal.febraban.org.br/Arquivos/documentos/PDF/Layout%20-%20C%C3%B3digo%20de%20Barras%20-%20Vers%C3%A3o%205%20-%2001_08_2016.pdf
    for (var i = 0; i < x.length; i++) {
      let mult = sequencia[j];
      j++;
      j %= sequencia.length;
      digit += mult * parseInt(x.charAt(i));
    }

    DAC = digit % 11;

    if (DAC == 0 || DAC == 1)
      return 0;
    if (DAC == 10)
      return 1;

    return (11 - DAC);

  }

  /**
   * Função auxiliar para remover os zeros à esquerda dos valores detectados no código inserido
   * @param {string} str Texto a ser verificado
   * @param {string} repl Texto que substituirá
   * @param {int} inicio Posição inicial
   * @param {int} tamanho Tamanho
   * @return {string} resultado
   */
  function substringReplace(str, repl, inicio, tamanho) {
    if (inicio < 0) {
      inicio = inicio + str.length;
    }

    tamanho = tamanho !== undefined ? tamanho : str.length;
    if (tamanho < 0) {
      tamanho = tamanho + str.length - inicio;
    }

    return [
      str.slice(0, inicio),
      repl.substr(0, tamanho),
      repl.slice(tamanho),
      str.slice(inicio + tamanho)
    ].join('');
  }
});