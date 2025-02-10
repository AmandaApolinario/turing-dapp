// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Turing is ERC20, Ownable {
    // Mapeamento para armazenar codinomes e endereços
    mapping(string => address) public codinomes;
    mapping (address => string) public codinomesInverso;

    // Mapeamento para armazenar se um usuário já votou em um codinome
    mapping(address => mapping(string => bool)) public hasVoted;

    // Endereço da professora
    address public professora = 0x502542668aF09fa7aea52174b9965A7799343Df7;

    // Estado da votação
    bool public votingEnabled = true;

    // Modifier para restringir funções apenas ao owner ou à professora
    modifier onlyOwnerOrProfessora() {
        require(msg.sender == owner() || msg.sender == professora, "Apenas o owner ou a professora podem executar esta funcao");
        _;
    }

    // Modifier para verificar se a votação está ativa
    modifier votingIsOn() {
        require(votingEnabled, "Votacao desativada");
        _;
    }

    // Modifier para verificar se o usuário está autorizado
    modifier onlyAuthorized(string memory codinome) {
        require(codinomes[codinome] != address(0), "Codinome nao autorizado");
        _;
    }

    // Construtor do contrato
    constructor() ERC20("Turing", "TUR") {

        codinomes["nome1"] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        codinomes["nome2"] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        codinomes["nome3"] = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
        codinomes["nome4"] = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
        codinomes["nome5"] = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;
        codinomes["nome6"] = 0x976EA74026E726554dB657fA54763abd0C3a0aa9;
        codinomes["nome7"] = 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955;
        codinomes["nome8"] = 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f;
        codinomes["nome9"] = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;
        codinomes["nome10"] = 0xBcd4042DE499D14e55001CcbB24a551F3b954096;
        codinomes["nome11"] = 0x71bE63f3384f5fb98995898A86B02Fb2426c5788;
        codinomes["nome12"] = 0xFABB0ac9d68B0B445fB7357272Ff202C5651694a;
        codinomes["nome13"] = 0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec;
        codinomes["nome14"] = 0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097;
        codinomes["nome15"] = 0xcd3B766CCDd6AE721141F452C550Ca635964ce71;
        codinomes["nome16"] = 0x2546BcD3c84621e976D8185a91A922aE77ECEc30;
        codinomes["nome17"] = 0xbDA5747bFD65F08deb54cb465eB87D40e51B197E;
        codinomes["nome18"] = 0xdD2FD4581271e230360230F9337D5c0430Bf44C0;
        codinomes["nome19"] = 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199;

        codinomesInverso[0x70997970C51812dc3A010C7d01b50e0d17dc79C8] = "nome1";
        codinomesInverso[0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC] = "nome2";
        codinomesInverso[0x90F79bf6EB2c4f870365E785982E1f101E93b906] = "nome3";
        codinomesInverso[0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65] = "nome4";
        codinomesInverso[0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc] = "nome5";
        codinomesInverso[0x976EA74026E726554dB657fA54763abd0C3a0aa9] = "nome6";
        codinomesInverso[0x14dC79964da2C08b23698B3D3cc7Ca32193d9955] = "nome7";
        codinomesInverso[0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f] = "nome8";
        codinomesInverso[0xa0Ee7A142d267C1f36714E4a8F75612F20a79720] = "nome9";
        codinomesInverso[0xBcd4042DE499D14e55001CcbB24a551F3b954096] = "nome10";
        codinomesInverso[0x71bE63f3384f5fb98995898A86B02Fb2426c5788] = "nome11";
        codinomesInverso[0xFABB0ac9d68B0B445fB7357272Ff202C5651694a] = "nome12";
        codinomesInverso[0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec] = "nome13";
        codinomesInverso[0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097] = "nome14";
        codinomesInverso[0xcd3B766CCDd6AE721141F452C550Ca635964ce71] = "nome15";
        codinomesInverso[0x2546BcD3c84621e976D8185a91A922aE77ECEc30] = "nome16";
        codinomesInverso[0xbDA5747bFD65F08deb54cb465eB87D40e51B197E] = "nome17";
        codinomesInverso[0xdD2FD4581271e230360230F9337D5c0430Bf44C0] = "nome18";
        codinomesInverso[0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199] = "nome19";


        // Inicializa a votação como ativa
        votingEnabled = true;
    }


    // Função para obter a lista de codinomes
    function getCodinomes() public pure returns (string[] memory) {
        string[] memory codinomesList = new string[](19);
        codinomesList[0] = "nome1";
        codinomesList[1] = "nome2";
        codinomesList[2] = "nome3";
        codinomesList[3] = "nome4";
        codinomesList[4] = "nome5";
        codinomesList[5] = "nome6";
        codinomesList[6] = "nome7";
        codinomesList[7] = "nome8";
        codinomesList[8] = "nome9";
        codinomesList[9] = "nome10";
        codinomesList[10] = "nome11";
        codinomesList[11] = "nome12";
        codinomesList[12] = "nome13";
        codinomesList[13] = "nome14";
        codinomesList[14] = "nome15";
        codinomesList[15] = "nome16";
        codinomesList[16] = "nome17";
        codinomesList[17] = "nome18";
        codinomesList[18] = "nome19";
        return codinomesList;
    }
   
    // Função para emitir tokens (minting)
    function issueToken(string memory codinome, uint256 quantidade) public onlyOwnerOrProfessora onlyAuthorized(codinome) {
        address receptor = codinomes[codinome];
        _mint(receptor, quantidade);
    }

    // Função para votar
    function vote(string memory codinome, uint256 quantidade) public votingIsOn onlyAuthorized(codinome) {
        require(quantidade <= 2 * 10**18, "Quantidade de Turings nao pode ser maior que 2");
        require(!hasVoted[msg.sender][codinome], "Voce ja votou neste codinome");
        require(codinomes[codinome] != msg.sender, "Voce nao pode votar em si mesmo");

        // Minting de saTurings para o codinome votado
        _mint(codinomes[codinome], quantidade);

        // Minting de 0.2 Turing para o votante
        _mint(msg.sender, 2 * 10**17);

        // Marca o voto como realizado
        hasVoted[msg.sender][codinome] = true;
    }

    // Função para ativar a votação
    function votingOn() public onlyOwnerOrProfessora {
        votingEnabled = true;
    }

    // Função para desativar a votação
    function votingOff() public onlyOwnerOrProfessora {
        votingEnabled = false;
    }
}