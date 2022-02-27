// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

//openzepplin
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
//for console.log
import "hardhat/console.sol";
//for getting length of strings
import {StringUtils} from "./libraries/StringUtils.sol";
//for base64 endcoing
import {Base64} from "./libraries/Base64.sol";

contract Domains is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string public tld; //the .X domain
    address payable public owner;

    //custom error messages
    error Unauthorized();
    error AlreadyRegistered();
    error InvalidName(string name);

    string svgPartOne =
        '<svg xmlns="http://www.w3.org/2000/svg" width="270" height="270" fill="none"><path fill="url(#B)" d="M0 0h270v270H0z"/><defs><filter id="A" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="270" width="270"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity=".225" width="200%" height="200%"/></filter></defs><path d="M72.863 42.949c-.668-.387-1.426-.59-2.197-.59s-1.529.204-2.197.59l-10.081 6.032-6.85 3.934-10.081 6.032c-.668.387-1.426.59-2.197.59s-1.529-.204-2.197-.59l-8.013-4.721a4.52 4.52 0 0 1-1.589-1.616c-.384-.665-.594-1.418-.608-2.187v-9.31c-.013-.775.185-1.538.572-2.208a4.25 4.25 0 0 1 1.625-1.595l7.884-4.59c.668-.387 1.426-.59 2.197-.59s1.529.204 2.197.59l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616c.384.665.594 1.418.608 2.187v6.032l6.85-4.065v-6.032c.013-.775-.185-1.538-.572-2.208a4.25 4.25 0 0 0-1.625-1.595L41.456 24.59c-.668-.387-1.426-.59-2.197-.59s-1.529.204-2.197.59l-14.864 8.655a4.25 4.25 0 0 0-1.625 1.595c-.387.67-.585 1.434-.572 2.208v17.441c-.013.775.185 1.538.572 2.208a4.25 4.25 0 0 0 1.625 1.595l14.864 8.655c.668.387 1.426.59 2.197.59s1.529-.204 2.197-.59l10.081-5.901 6.85-4.065 10.081-5.901c.668-.387 1.426-.59 2.197-.59s1.529.204 2.197.59l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616c.384.665.594 1.418.608 2.187v9.311c.013.775-.185 1.538-.572 2.208a4.25 4.25 0 0 1-1.625 1.595l-7.884 4.721c-.668.387-1.426.59-2.197.59s-1.529-.204-2.197-.59l-7.884-4.59a4.52 4.52 0 0 1-1.589-1.616c-.385-.665-.594-1.418-.608-2.187v-6.032l-6.85 4.065v6.032c-.013.775.185 1.538.572 2.208a4.25 4.25 0 0 0 1.625 1.595l14.864 8.655c.668.387 1.426.59 2.197.59s1.529-.204 2.197-.59l14.864-8.655c.657-.394 1.204-.95 1.589-1.616s.594-1.418.609-2.187V55.538c.013-.775-.185-1.538-.572-2.208a4.25 4.25 0 0 0-1.625-1.595l-14.993-8.786z" fill="#fff"/><defs><linearGradient id="B" x1="0" y1="0" x2="270" y2="270" gradientUnits="userSpaceOnUse"><stop stop-color="#cb5eee"/><stop offset="1" stop-color="#0cd7e4" stop-opacity=".99"/></linearGradient></defs><text x="32.5" y="231" font-size="27" fill="#fff" filter="url(#A)" font-family="Plus Jakarta Sans,DejaVu Sans,Noto Color Emoji,Apple Color Emoji,sans-serif" font-weight="bold">';
    string svgPartTwo = "</text></svg>";

    constructor(string memory _tld)
        payable
        ERC721("Los Tacos Name Service", "LTNS")
    {
        tld = _tld;
        owner = payable(msg.sender);
        console.log("%s name service deployed", _tld);
    }

    // Mapping domain name to the owner
    mapping(string => address) public domains;

    // // Mapping domain name to the record
    // mapping(string => string) public records;

    // Mapping the tokenId to the domain name
    mapping(uint256 => string) public names;

    //function that determines price of domaine based on length
    function price(string calldata name) public pure returns (uint256) {
        uint256 len = StringUtils.strlen(name);
        require(len > 0);
        //the MATIC token has 18 decimals
        if (len == 3) {
            return 3 * 10**17; // 5 MATIC = 5 000 000 000 000 000 000 (18 decimals). We're going with 0.5 Matic cause the faucets don't give a lot.
        } else if (len == 4) {
            return 2 * 10**17; // To charge smaller amounts, reduce the decimals. This is 0.3
        } else {
            return 1 * 10**17;
        }
    }

    //function that makes sure the domain length is between 3 & 10 characters
    function valid(string calldata name) public pure returns (bool) {
        uint256 len = StringUtils.strlen(name);
        return len >= 3 && len <= 10;
    }

    // A register function that adds their names to our mapping
    //calldata = the location of where the 'name'argument should be stored
    function register(string calldata name) public payable {
        //check that the name is unregistered
        //checking that the address of the domain you’re trying to register is the same as the zero address.
        // require(
        //     domains[name] == address(0),
        //     "This domain name has already been registered"
        // );
        //or can do this
        if(domains[name] != address(0)) revert AlreadyRegistered();

        //checking length
        if(!valid(name)) revert InvalidName(name);

        uint256 _price = price(name);
        //check that enough MATIC was sent with the transaction
        require(msg.value >= _price, "You didn't send enough MATIC");

        // Combine the name passed into the function  with the TLD
        string memory _name = string(abi.encodePacked(name, ".", tld));
        // Create the SVG (image) for the NFT with the name
        string memory finalSvg = string(
            abi.encodePacked(svgPartOne, _name, svgPartTwo)
        );
        uint256 newRecordId = _tokenIds.current();
        uint256 length = StringUtils.strlen(name); //converts uint to string
        string memory strLen = Strings.toString(length);
        console.log(
            "Reigstering %s.%s with tokenId %d",
            name,
            tld,
            newRecordId
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        _name,
                        '", "description": "A domain on the Tacos name service.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(finalSvg)),
                        '","length":"',
                        strLen,
                        '"}'
                    )
                )
            )
        );

        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        // console.log(
        //     "\n--------------------------------------------------------"
        // );
        // console.log("Final tokenURI", finalTokenUri);
        // console.log(
        //     "--------------------------------------------------------\n"
        // );

        _safeMint(msg.sender, newRecordId);
        _setTokenURI(newRecordId, finalTokenUri);
        domains[name] = msg.sender;
        names[newRecordId] = name;
        _tokenIds.increment();
    }

    // This will give us the domain owners' address
    function getAddress(string calldata name) public view returns (address) {
        return domains[name];
    }

    // function setRecord(string calldata name, string calldata record) public {
    //     require(
    //         domains[name] == msg.sender,
    //         "You must be the owner of this domain to set a record"
    //     );
    //     records[name] = record;
    // }

    // function getRecord(string calldata name)
    //     public
    //     view
    //     returns (string memory)
    // {
    //     return records[name];
    // }

    //get all domain names
    function getAllNames() public view returns (string[] memory) {
        console.log("Getting all domain names from the contract");
        string[] memory allNames = new string[](_tokenIds.current()); //create array of strengs, length = current tokenId
        for (uint256 i = 0; i < _tokenIds.current(); i++) {
            allNames[i] = names[i]; //adding domain name to the array
            console.log("Name for token %d is %s", i, allNames[i]);
        }
        return allNames;
    }

    modifier onlyOwner() {
        require(isOwner());
        _;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to withdraw Matic");
    }
}
