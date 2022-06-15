<template>

<div class="w3-display-middle">
	
	<div id="app" class="w3-row w3-col s3" style="min-width: 350px;margin-left: auto;margin-right: auto;">
		<form class="w3-container" action="#">
			<div class="w3-section w3-border w3-padding w3-round-large w3-padding-64">
				<label class="w3-margin-bottom"><b>Username</b></label>
				<input class="w3-input w3-border w3-margin-bottom w3-round-large w3-border-teal" type="text" placeholder="Enter Username" name="usrname" required="">

				<label class="w3-margin-bottom"><b>Password</b></label>
				<input class="w3-input w3-border w3-round-large w3-border-teal" type="password" placeholder="Enter Password" name="psw" required="">

				<button class="w3-button w3-block w3-section w3-padding w3-teal w3-round-large" type="submit">Login</button>
			</div>
		</form>
	</div>
</div>

</template>

<scrip>
	export default {
		name: "Login"
	}
</scrip>