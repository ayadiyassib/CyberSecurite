# CyberSecurite

<details open>
<summary><b>TD1: Blockchain</b> | $\color{red}{\text{(Click to open / close)}}$</summary>

<br>

**EXERCICE 1:** <ins>Td1_blockchain\merkle.cpp</ins>

#### Run:

```bash    
g++ merkle.cpp -o merkle -lcrypto && ./merkle 
```
![Exercise 1 Output](images/image1.png)

---

**EXERCICE 2:** <ins>Td1_blockchain\pow.cpp</ins>

#### RUN: 
    
```bash
g++ pow.cpp -o pow -lcrypto && ./pow 
```
![Exercise 2 Output](images/image2.png)

---

**EXERCICE 3:**  <ins>Td1_blockchain\pos.cpp</ins>

#### RUN: 
    
```bash
g++ pow.cpp -o pow -lcrypto && ./pow 
```
![Exercise 3 Output](images/image3.png)

---

**EXERCICE 4:** <ins>Td1_blockchain\blockchain.cpp</ins>

#### RUN: 
    
```bash
g++ pow.cpp -o pow -lcrypto && ./pow 
```
![Exercise 4 Output](images/image4.png)
</details>

<!-------------------->
<details open>

<summary><b>Atelier 2: Plateforme de Simulation d'attaques</b> | $\color{red}{\text{(Click to open / close)}}$</summary>

<br>

**Plateforme Globale: Simulation, Detection & Evaluation des Attaques** : <ins>Td2_blockchain/plateforme.cpp</ins>

*Cette plateforme simule les 4 attaques (51% & Double Spending, Selfish Mining, Block Withholding et Sybil Attack), intègre les métriques de détection avec contre-mesures, et affiche une évaluation comparative (Normale vs Attaquée vs Protégée).*

#### Run:
```bash    
g++ attack_51.cpp -o attack_51 -lcrypto && ./attack_51
``` 
![Exercice Output](images/image5.png)
###### Suite Execution:
![Exercice Output](images/image6.png)
</details>