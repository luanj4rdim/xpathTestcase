const baseUrl = 'https://automationexercise.com';

function createUser() {
	const uniqueId = `${Date.now()}${Cypress._.random(1000, 9999)}`;
	return {
		name: `Cypress User ${uniqueId}`,
		email: `cypress.${uniqueId}@example.com`,
		password: `Pass${uniqueId}!`,
	};
}

function homeIsVisible() {
	cy.visit('/');
	cy.xpath("//a[@href='/products']").should('be.visible');
}

function openLogin() {
	cy.xpath("//a[@href='/login']").click();
	cy.xpath("//h2[normalize-space()='Login to your account']").should('be.visible');
}

function completeRegistration(user) {
	openLogin();
	cy.xpath("//input[@data-qa='signup-name']").type(user.name);
	cy.xpath("//input[@data-qa='signup-email']").type(user.email);
	cy.xpath("//button[@data-qa='signup-button']").click();

	cy.xpath("//b[contains(translate(., 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'ENTER ACCOUNT INFORMATION')]")
		.should('be.visible');
	cy.xpath("//input[@id='id_gender1']").check({ force: true });
	cy.xpath("//input[@data-qa='password']").type(user.password);
	cy.xpath("//select[@data-qa='days']").select('10');
	cy.xpath("//select[@data-qa='months']").select('May');
	cy.xpath("//select[@data-qa='years']").select('1990');
	cy.xpath("//input[@id='newsletter']").check({ force: true });
	cy.xpath("//input[@id='optin']").check({ force: true });
	cy.xpath("//input[@data-qa='first_name']").type('Automation');
	cy.xpath("//input[@data-qa='last_name']").type('Tester');
	cy.xpath("//input[@data-qa='company']").type('Example Co.');
	cy.xpath("//input[@data-qa='address']").type('123 Test Street');
	cy.xpath("//select[@data-qa='country']").select('Canada');
	cy.xpath("//input[@data-qa='state']").type('Ontario');
	cy.xpath("//input[@data-qa='city']").type('Toronto');
	cy.xpath("//input[@data-qa='zipcode']").type('M5V 2T6');
	cy.xpath("//input[@data-qa='mobile_number']").type('4165550123');
	cy.xpath("//button[@data-qa='create-account']").click();

	cy.xpath("//b[normalize-space()='Account Created!']").should('be.visible');
	cy.xpath("//a[@data-qa='continue-button']").click();
	cy.xpath(`//a[contains(., 'Logged in as') and contains(., '${user.name}')]`).should('be.visible');
}

function deleteCurrentAccount() {
	cy.xpath("//a[@href='/delete_account']").click();
	cy.xpath("//b[normalize-space()='Account Deleted!']").should('be.visible');
	cy.xpath("//a[@data-qa='continue-button']").click();
}

function login(user) {
	openLogin();
	cy.xpath("//input[@data-qa='login-email']").type(user.email);
	cy.xpath("//input[@data-qa='login-password']").type(user.password);
	cy.xpath("//button[@data-qa='login-button']").click();
}

describe('Automation Exercise: primeiros 10 casos', () => {
	it('TC01 - registra um usuário e exclui a conta', () => {
		const user = createUser();
		homeIsVisible();
		completeRegistration(user);
		deleteCurrentAccount();
	});

	it('TC02 - faz login com credenciais válidas', () => {
		const user = createUser();
		homeIsVisible();
		completeRegistration(user);
		cy.xpath("//a[@href='/logout']").click();
		login(user);
		cy.xpath(`//a[contains(., 'Logged in as') and contains(., '${user.name}')]`).should('be.visible');
		deleteCurrentAccount();
	});

	it('TC03 - exibe erro para credenciais inválidas', () => {
		homeIsVisible();
		openLogin();
		cy.xpath("//input[@data-qa='login-email']").type(`invalid.${Date.now()}@example.com`);
		cy.xpath("//input[@data-qa='login-password']").type('incorrect-password');
		cy.xpath("//button[@data-qa='login-button']").click();
		cy.xpath("//p[contains(., 'Your email or password is incorrect!')]").should('be.visible');
	});

	it('TC04 - encerra a sessão do usuário', () => {
		const user = createUser();
		homeIsVisible();
		completeRegistration(user);
		cy.xpath("//a[@href='/logout']").click();
		cy.location('pathname').should('eq', '/login');
		login(user);
		deleteCurrentAccount();
	});

	it('TC05 - impede cadastro com um e-mail já registrado', () => {
		const user = createUser();
		homeIsVisible();
		completeRegistration(user);
		cy.xpath("//a[@href='/logout']").click();
		openLogin();
		cy.xpath("//input[@data-qa='signup-name']").type('Duplicate User');
		cy.xpath("//input[@data-qa='signup-email']").type(user.email);
		cy.xpath("//button[@data-qa='signup-button']").click();
		cy.xpath("//p[contains(., 'Email Address already exist!')]").should('be.visible');
		login(user);
		deleteCurrentAccount();
	});

	it('TC06 - envia o formulário Contact Us', () => {
		homeIsVisible();
		cy.xpath("//a[@href='/contact_us']").click();
		cy.xpath("//h2[contains(., 'Get In Touch')]").should('be.visible');
		cy.xpath("//input[@data-qa='name']").type('Cypress Tester');
		cy.xpath("//input[@data-qa='email']").type(`contact.${Date.now()}@example.com`);
		cy.xpath("//input[@data-qa='subject']").type('Automated contact form test');
		cy.xpath("//textarea[@data-qa='message']").type('Mensagem de teste automatizado.');
		cy.xpath("//input[@type='file']").selectFile({
			contents: Cypress.Buffer.from('Arquivo de teste Cypress.'),
			fileName: 'contact-test.txt',
			mimeType: 'text/plain',
		}, { force: true });
		cy.on('window:confirm', () => true);
		cy.xpath("//input[@data-qa='submit-button']").click();
		cy.xpath("//div[contains(@class, 'status') and contains(., 'Success! Your details have been submitted successfully.')]")
			.should('be.visible');
		cy.xpath("//a[@href='/']").filter(':visible').first().click();
		cy.location('pathname').should('eq', '/');
	});

	it('TC07 - abre a página Test Cases', () => {
		homeIsVisible();
		cy.xpath("//a[@href='/test_cases']").filter(':visible').first().click();
		cy.location('pathname').should('eq', '/test_cases');
		cy.xpath("//h2[normalize-space()='Test Cases']").should('be.visible');
	});

	it('TC08 - lista produtos e abre o detalhe do primeiro', () => {
		homeIsVisible();
		cy.xpath("//a[@href='/products']").click();
		cy.location('pathname').should('eq', '/products');
		cy.xpath("//h2[contains(., 'All Products')]").should('be.visible');
		cy.xpath("//div[contains(@class, 'features_items')]//a[@href='/product_details/1']").click();
		cy.location('pathname').should('eq', '/product_details/1');
		cy.xpath("//div[contains(@class, 'product-information')]").should('be.visible')
			.and('contain.text', 'Blue Top')
			.and('contain.text', 'Category:')
			.and('contain.text', 'Rs. 500')
			.and('contain.text', 'Availability:')
			.and('contain.text', 'Condition:')
			.and('contain.text', 'Brand:');
	});

	it('TC09 - pesquisa um produto e valida o resultado', () => {
		homeIsVisible();
		cy.xpath("//a[@href='/products']").click();
		cy.xpath("//input[@id='search_product']").type('Blue Top');
		cy.xpath("//button[@id='submit_search']").click();
		cy.xpath("//h2[contains(., 'Searched Products')]").should('be.visible');
		cy.xpath("//div[contains(@class, 'features_items')]//p[normalize-space()='Blue Top']").should('be.visible');
	});

	it('TC10 - confirma a assinatura da newsletter na página inicial', () => {
		homeIsVisible();
		cy.xpath('//footer').scrollIntoView();
		cy.xpath("//footer//h2[contains(., 'Subscription')]").should('be.visible');
		cy.xpath("//input[@id='susbscribe_email']").type(`newsletter.${Date.now()}@example.com`);
		cy.xpath("//button[@id='subscribe']").click();
		cy.xpath("//div[contains(@class, 'alert-success') and contains(., 'You have been successfully subscribed!')]")
			.should('be.visible');
	});
});
// Percepções para compartilhar na aula: 
// XPath facilita localizar elementos pelo texto ou pela relação entre elementos
// , mas expressões longas tendem a ser menos legíveis e mais frágeis. 
// Quando há data-qa ou IDs estáveis, vale priorizá-los; nesta suíte, 
// eles aparecem dentro de XPath. A execução levou cerca de 2min30, principalmente 
// nos fluxos remotos de cadastro e login; sem um benchmark isolado, 
// não dá para atribuir essa duração aos seletores.
